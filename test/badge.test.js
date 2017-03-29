var BaseSync = require('logux-sync').BaseSync
var TestPair = require('logux-sync').TestPair
var SyncError = require('logux-sync').SyncError
var Client = require('logux-client').Client

var badge = require('../badge')
var messages = require('../badge/en')
var styles = require('../badge/default')

var badgeId = 'logux-status-badge'
var badgeMessageId = 'logux-status-badge-message'
var badgeIconId = 'logux-status-badge-icon'

function getBadge () {
  return document.getElementById(badgeId)
}

function getBadgeIcon () {
  return document.getElementById(badgeIconId)
}
function getBadgeMessage () {
  return document.getElementById(badgeMessageId).innerHTML
}

function createClient () {
  var client = new Client({
    subprotocol: '1.0.0',
    userId: false,
    url: 'wss://localhost:1337'
  })

  var pair = new TestPair()
  var sync = new BaseSync('client', client.log, pair.left)
  sync.catch(function () { })
  sync.emitter = client.sync.emitter
  client.sync = sync
  client.role = 'leader'

  return pair.left.connect().then(function () {
    return client
  })
}

afterEach(function () {
  if (getBadge()) document.body.removeChild(getBadge())
})

it('sets widget position', function () {
  return createClient().then(function (client) {
    var unbind = badge(client, {
      position: 'bottom-left',
      styles: styles
    })
    expect(getBadge().style.bottom).toBe('0px')
    expect(getBadge().style.left).toBe('0px')

    unbind()
  })
})

it('hides missing widget icons', function () {
  return createClient().then(function (client) {
    var unbind = badge(client)

    client.sync.setState('wait')
    expect(getBadgeIcon().style.display).toBe('none')

    unbind()
  })
})

it('changes widget message on state events', function () {
  return createClient().then(function (client) {
    var unbind = badge(client, {
      messages: messages
    })

    client.sync.setState('wait')
    expect(getBadgeMessage()).toBe(messages.wait)

    client.sync.setState('connecting')
    expect(getBadgeMessage()).toBe(messages.sending)

    client.sync.setState('sending')
    expect(getBadgeMessage()).toBe(messages.sending)

    client.sync.setState('synchronized')
    expect(getBadgeMessage()).toBe(messages.synchronized)

    client.sync.setState('disconnected')
    expect(getBadgeMessage()).toBe(messages.disconnected)

    unbind()
  })
})

it('changes widget messages on errors', function () {
  return createClient().then(function (client) {
    var unbind = badge(client, {
      messages: messages
    })

    var supported = { supported: ['A'], used: ['B'] }

    var error = new SyncError(client.sync, 'wrong-protocol', supported)
    client.sync.emitter.emit('error', error)
    expect(getBadgeMessage()).toBe(messages.protocolError)

    error = new SyncError(client.sync, 'wrong-subprotocol', supported)
    client.sync.emitter.emit('error', error)
    expect(getBadgeMessage()).toBe(messages.protocolError)

    error = new SyncError(client.sync, 'wrong-format', supported)
    client.sync.emitter.emit('error', error)
    expect(getBadgeMessage()).toBe(messages.serverError)

    unbind()
  })
})

it('supports cross-tab synchronization', function () {
  return createClient().then(function (client) {
    client.role = 'follower'
    var unbind = badge(client, {
      messages: messages,
      styles: styles
    })

    client.state = 'disconnected'
    client.emitter.emit('state')
    expect(getBadgeMessage()).toBe(messages.disconnected)
    expect(getBadge().style.opacity).toBe('1')

    unbind()
  })
})

it('returns unbind function and remove widget from DOM', function () {
  return createClient().then(function (client) {
    var unbind = badge(client)
    unbind()

    client.sync.setState('wait')
    expect(getBadge()).toBe(null)
  })
})

it('hides widget after timeout on synchronized state', function () {
  return createClient().then(function (client) {
    var unbind = badge(client, { styles: styles })

    client.sync.setState('synchronized')
    expect(getBadge().style.opacity).toBe('0')

    client.sync.setState('wait')
    client.sync.setState('sending')
    jest.useFakeTimers()
    client.sync.setState('synchronized')
    expect(getBadge().style.opacity).toBe('1')

    jest.runAllTimers()
    expect(setTimeout.mock.calls.length).toBe(1)
    expect(setTimeout.mock.calls[0][1]).toBe(styles.timeout)
    expect(getBadge().style.opacity).toBe('0')

    unbind()
  })
})

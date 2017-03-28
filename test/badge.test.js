var BaseSync = require('logux-sync').BaseSync
var TestPair = require('logux-sync').TestPair
var TestTime = require('logux-core').TestTime
var SyncError = require('logux-sync').SyncError

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

function createTest () {
  var pair = new TestPair()
  pair.leftSync = new BaseSync('client', TestTime.getLog(), pair.left)
  pair.leftSync.catch(function () { })
  return pair.left.connect().then(function () {
    return pair
  })
}

afterEach(function () {
  if (getBadge()) document.body.removeChild(getBadge())
})

it('sets widget position', function () {
  return createTest().then(function (test) {
    var unbind = badge({ sync: test.leftSync }, {
      position: 'bottom-left',
      styles: styles
    })
    expect(getBadge().style.bottom).toBe('0px')
    expect(getBadge().style.left).toBe('0px')

    unbind()
  })
})

it('hides missing widget icons', function () {
  return createTest().then(function (test) {
    var unbind = badge({ sync: test.leftSync })

    test.leftSync.setState('wait')
    expect(getBadgeIcon().style.display).toBe('none')

    unbind()
  })
})

it('changes widget message on state events', function () {
  return createTest().then(function (test) {
    var unbind = badge({ sync: test.leftSync }, {
      messages: messages
    })

    test.leftSync.setState('wait')
    expect(getBadgeMessage()).toBe(messages.wait)

    test.leftSync.setState('connecting')
    expect(getBadgeMessage()).toBe(messages.sending)

    test.leftSync.setState('sending')
    expect(getBadgeMessage()).toBe(messages.sending)

    test.leftSync.setState('synchronized')
    expect(getBadgeMessage()).toBe(messages.synchronized)

    test.leftSync.setState('disconnected')
    expect(getBadgeMessage()).toBe(messages.disconnected)

    unbind()
  })
})

it('changes widget messages on errors', function () {
  return createTest().then(function (test) {
    var unbind = badge({ sync: test.leftSync }, {
      messages: messages
    })

    var supported = { supported: ['A'], used: ['B'] }

    test.leftSync.emitter.emit('error', new SyncError(test.leftSync,
                                                'wrong-protocol', supported))
    expect(getBadgeMessage()).toBe(messages.protocolError)

    test.leftSync.emitter.emit('error', new SyncError(test.leftSync,
                                                'wrong-subprotocol', supported))
    expect(getBadgeMessage()).toBe(messages.protocolError)

    test.leftSync.emitter.emit('error', new SyncError(test.leftSync,
                                                'wrong-format'))
    expect(getBadgeMessage()).toBe(messages.serverError)

    unbind()
  })
})

it('returns unbind function and remove widget from DOM', function () {
  return createTest().then(function (test) {
    var unbind = badge({ sync: test.leftSync })
    unbind()

    test.leftSync.setState('wait')
    expect(getBadge()).toBeNull()
  })
})

it('hides widget after timeout on synchronized state', function () {
  return createTest().then(function (test) {
    var unbind = badge({ sync: test.leftSync }, {
      styles: styles
    })

    test.leftSync.setState('synchronized')
    expect(getBadge().style.opacity).toBe('0')

    test.leftSync.setState('wait')
    test.leftSync.setState('sending')

    jest.useFakeTimers()
    test.leftSync.setState('synchronized')
    expect(getBadge().style.opacity).toBe('1')

    jest.runAllTimers()
    expect(setTimeout.mock.calls.length).toBe(1)
    expect(setTimeout.mock.calls[0][1]).toBe(styles.timeout)
    expect(getBadge().style.opacity).toBe('0')

    unbind()
  })
})

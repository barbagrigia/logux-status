var BaseSync = require('logux-sync').BaseSync
var TestPair = require('logux-sync').TestPair
var Client = require('logux-client').Client

var confirm = require('../confirm')

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

var beforeunloader
var originAdd = window.addEventListener
var originRemove = window.removeEventListener

beforeEach(function () {
  delete window.event
  beforeunloader = false

  window.addEventListener = jest.fn(function (name, callback) {
    if (name === 'beforeunload') beforeunloader = callback
  })
  window.removeEventListener = jest.fn(function (name, callback) {
    if (name === 'beforeunload' && beforeunloader === callback) {
      beforeunloader = false
    }
  })
})
afterEach(function () {
  window.addEventListener = originAdd
  window.removeEventListener = originRemove
})

it('confirms close', function () {
  return createClient().then(function (client) {
    confirm(client)

    client.sync.setState('wait')
    expect(beforeunloader()).toEqual('unsynced')

    client.sync.setState('sending')
    var e = { }
    beforeunloader(e)
    expect(e.returnValue).toEqual('unsynced')

    window.event = { }
    beforeunloader()
    expect(window.event.returnValue).toEqual('unsynced')
  })
})

it('does not confirm on synchronized state', function () {
  return createClient().then(function (client) {
    confirm(client)
    client.sync.setState('wait')
    client.sync.setState('synchronized')
    expect(beforeunloader).toBeFalsy()
  })
})

it('does not confirm on follower tab', function () {
  return createClient().then(function (client) {
    confirm(client)
    client.sync.setState('wait')
    client.role = 'follower'
    client.emitter.emit('role')
    expect(beforeunloader).toBeFalsy()
  })
})

it('returns unbind function', function () {
  return createClient().then(function (client) {
    var unbind = confirm(client)
    unbind()
    client.sync.setState('wait')
    expect(beforeunloader).toBeFalsy()
  })
})

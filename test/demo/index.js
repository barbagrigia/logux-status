var MemoryStore = require('logux-core/memory-store')
var ClientSync = require('logux-sync/client-sync')
var LocalPair = require('logux-sync/local-pair')
var BaseSync = require('logux-sync/base-sync')
var Log = require('logux-core/log')

var Client = require('logux-client/client')

// Logux Status features
var attention = require('../../attention')
var confirm = require('../../confirm')
var favicon = require('../../favicon')
var log = require('../../log')
var badge = require('../../badge')

var faviconNormal = require('./normal.png')
var faviconOffline = require('./offline.png')
var faviconError = require('./error.png')

var styles = require('../../badge/default')
var messages = require('../../badge/en')

var pair = new LocalPair()

var serverLog = new Log({
  store: new MemoryStore(),
  nodeId: 'server'
})
new BaseSync('server', serverLog, pair.right)

var client = new Client({
  subprotocol: '1.0.0',
  userId: 10,
  url: 'wss://example.com/'
})
var old = client.sync
client.sync = new ClientSync(client.sync.localNodeId, client.log, pair.left)
client.sync.emitter = old.emitter

attention(client)
confirm(client)
favicon(client, {
  normal: faviconNormal,
  offline: faviconOffline,
  error: faviconError
})
log(client)
badge(client, {
  position: 'bottom-right',
  messages: messages,
  styles: styles
})

client.sync.on('state', function () {
  document.all.connection.checked = client.sync.connected
})

client.start()

document.all.connection.onchange = function (e) {
  if (e.target.checked) {
    client.sync.connection.connect()
  } else {
    client.sync.connection.disconnect()
  }
}

document.all.clientError.onclick = function () {
  setTimeout(function () {
    client.sync.syncError('wrong-format')
  }, 3000)
}

document.all.serverError.onclick = function () {
  setTimeout(function () {
    pair.right.send(['error', 'wrong-format'])
  }, 3000)
}

document.all.protocolError.onclick = function () {
  setTimeout(function () {
    client.sync.syncError('wrong-protocol',
                          { supported: ['1.0'], used: ['1.1.0'] })
  }, 3000)
}

document.all.setSynchronized.onclick = function () {
  setTimeout(function () {
    client.sync.setState('wait')
    setTimeout(function () {
      client.sync.setState('connecting')
      setTimeout(function () {
        client.sync.setState('sending')
        setTimeout(function () {
          client.sync.setState('synchronized')
        }, 500)
      }, 500)
    }, 1000)
  }, 1000)
}

document.all.add.onclick = function () {
  client.log.add({ type: 'TEST' }, { reasons: ['test'] })
}

document.all.clean.onclick = function () {
  client.log.removeReason('test')
}

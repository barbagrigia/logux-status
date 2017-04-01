function setPosition (element, position) {
  var pos = position.split('-')
  element.style[pos[0]] = element.style[pos[1]] = 0
}

function setInlineStyle (element, style) {
  for (var property in style) {
    if (element.style[property] !== style[property]) {
      element.style[property] = style[property]
    }
  }
}

function setIcon (element, icon) {
  if (icon) {
    element.style.display = 'block'
    element.style.backgroundImage = 'url(' + icon + ')'
  } else {
    element.style.display = 'none'
  }
}

/**
 * Shows widget to display synchronization status.
 *
 * @param {Client} client Observed Client instance.
 * @param {Object} [settings] Widget settings.
 * @param {String} [settings.position] Sets widget position. One of
 *                                    'bottom-left', 'bottom-right',
 *                                    'top-left', 'top-right'.
 * @param {Object} [settings.messages] Sets widget messages on state events and
 *                                     errors.
 * @param {String} [messages.disconnected] Disconnected state message.
 * @param {String} [messages.wait] Wait state message.
 * @param {String} [messages.connecting] Connecting state message.
 * @param {String} [messages.sending] Sending state message.
 * @param {String} [messages.synchronized] Synchronized state message.
 * @param {String} [messages.protocolError] Wrong protocol and wrong sub
 *                                          protocol errors message.
 * @param {String} [messages.error] Error message with exception of wrong
 *                                  protocol and wrong sub protocol.
 * @param {Object} [settings.styles] Sets widget inline styles, icons links and
 *                                   timeout to display synchronized state.
 * @param {Object} [styles.icons] Sets icons links.
 * @param {Object} [styles.widget] Sets widget common inline styles.
 * @param {Object} [styles.icon] Sets inline styles for icons.
 * @param {Object} [styles.normal] Sets inline styles for states, wrong protocol
 *                                 and wrong sub protocol errors.
 * @param {Object} [styles.error] Sets inline styles for errors with exception
 *                                of wrong protocol and wrong sub protocol.
 * @param {Number} [styles.timeout] Sets delay to display synchronized state.
 *
 * @return {Function} Unbind widget listener and remove widget from DOM.
 *
 * @example
 * import badge from 'logux-status/badge'
 * import en from 'logux-status/badge/en'
 * import default from 'logux-status/badge/default'
 * badge(client, {
 *   position: 'bottom-left',
 *   messages: en,
 *   styles: default
 * })
 */
function badge (client, settings) {
  settings = settings || {}

  var position = settings.position || 'bottom-right'
  var messages = settings.messages || {}
  var styles = settings.styles || {}

  var icons = styles.icons || {}
  var timeout = styles.timeout || 2000
  var normal = styles.normal
  var error = styles.error

  var unbind = []
  var widget = false
  var message = false
  var icon = false
  var prevState = false

  function createWidget () {
    widget = document.createElement('div')
    widget.id = 'logux-status-badge'
    setPosition(widget, position)
    setInlineStyle(widget, styles.widget)

    message = document.createElement('span')
    message.id = 'logux-status-badge-message'
    widget.appendChild(message)

    icon = document.createElement('div')
    icon.id = 'logux-status-badge-icon'
    setInlineStyle(icon, styles.icon)
    widget.appendChild(icon)

    document.body.appendChild(widget)
  }

  if (typeof document !== 'undefined') {
    createWidget()
    unbind.push(client.on('state', function () {
      setInlineStyle(widget, normal)
      switch (client.state) {
        case 'synchronized':
          if (prevState === 'connecting' || prevState === 'sending') {
            setIcon(icon, icons.synchronized)
            message.innerHTML = messages.synchronized
            widget.style.visibility = 'visible'
            setTimeout(function () {
              widget.style.visibility = 'hidden'
            }, timeout)
          } else {
            widget.style.visibility = 'hidden'
          }
          break
        case 'wait':
          message.innerHTML = messages.wait
          setIcon(icon, icons.wait)
          widget.style.visibility = 'visible'
          break
        case 'connecting':
          if (prevState === 'wait') {
            setIcon(icon, icons.connecting)
            message.innerHTML = messages.connecting
            widget.style.visibility = 'visible'
          }
          break
        case 'sending':
          if (prevState === 'wait') {
            setIcon(icon, icons.sending)
            message.innerHTML = messages.sending
            widget.style.visibility = 'visible'
          }
          break
        case 'disconnected':
          message.innerHTML = messages.disconnected
          setIcon(icon, icons.disconnected)
          widget.style.visibility = 'visible'
          break
      }
      prevState = client.state
    }))

    unbind.push(client.sync.on('error', function (err) {
      if (err.type === 'wrong-protocol' || err.type === 'wrong-subprotocol') {
        setIcon(icon, icons.protocolError)
        message.innerHTML = messages.protocolError
        setInlineStyle(widget, normal)
      } else {
        setIcon(icon, icons.serverError)
        message.innerHTML = messages.error
        setInlineStyle(widget, error)
      }
      widget.style.visibility = 'visible'
    }))
  }

  return function () {
    for (var i = 0; i < unbind.length; i++) {
      unbind[i]()
    }
    widget.parentNode.removeChild(widget)
  }
}

module.exports = badge

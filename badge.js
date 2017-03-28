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
 * Show widget to display synchronization status.
 *
 * @param {Client} client Observed Client instance.
 * @param {object} [settings] Widget settings.
 * @param {string} [settings.position] Set widget position. One of
 *                                    'bottom-left', 'bottom-right',
 *                                    'top-left', 'top-right'.
 * @param {object} [settings.messages] Set widget messages on states and errors.
 * @param {string} [messages.disconnected] Disconnected state message.
 * @param {string} [messages.wait] Wait state message.
 * @param {string} [messages.sending] Sending or connecting states message.
 * @param {string} [messages.synchronized] Synchronized state message.
 * @param {string} [messages.protocolError] Protocol errors message.
 * @param {string} [messages.serverError] Server errors message.
 * @param {object} [settings.styles] Set widget icons links and inline styles.
 * @param {object} [settings.icons] Set icons links.
 * @param {object} [styles.widget] Set widget common inline styles.
 * @param {object} [styles.icon] Set icon inline styles.
 * @param {object} [styles.normal] Set normal inline styles.
 * @param {object} [styles.error] Set server errors inline styles.
 * @param {object} [styles.hidden] Set hidden inline styles.
 * @param {object} [styles.visible] Set visible inline styles.
 * @param {number} [styles.timeout] Set timeout to display synchronized state.
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
  var sync = client.sync
  settings = settings || {}

  var position = settings.position || 'bottom-right'
  var messages = settings.messages || {}
  var styles = settings.styles || {}

  var icons = styles.icons || {}
  var timeout = styles.timeout || 2000
  var normal = styles.normal
  var error = styles.error
  var visible = styles.visible
  var hidden = styles.hidden

  var unbind = []
  var widget = false
  var icon = false
  var prevState = false

  if (typeof document !== 'undefined') {
    widget = document.createElement('div')
    widget.id = 'logux-status-badge'
    document.body.appendChild(widget)
    setInlineStyle(widget, styles.widget)
    setPosition(widget, position)

    var message = document.createElement('span')
    message.id = 'logux-status-badge-message'
    widget.appendChild(message)

    icon = document.createElement('div')
    icon.id = 'logux-status-badge-icon'
    widget.appendChild(icon)
    setInlineStyle(icon, styles.icon)

    unbind.push(sync.on('state', function () {
      setInlineStyle(widget, normal)
      switch (sync.state) {
        case 'synchronized':
          setIcon(icon, icons.success)
          message.innerHTML = messages.synchronized
          if (prevState === 'connecting' || prevState === 'sending') {
            setInlineStyle(widget, visible)
            setTimeout(function () {
              setInlineStyle(widget, hidden)
            }, timeout)
          } else {
            setInlineStyle(widget, hidden)
          }
          break
        case 'wait':
          message.innerHTML = messages.wait
          setIcon(icon, icons.attention)
          setInlineStyle(widget, visible)
          break
        case 'connecting':
        case 'sending':
          if (prevState === 'wait') {
            setIcon(icon, icons.sending)
            message.innerHTML = messages.sending
            setInlineStyle(widget, visible)
          }
          break
        case 'disconnected':
          message.innerHTML = messages.disconnected
          setIcon(icon, icons.attention)
          setInlineStyle(widget, visible)
          break
      }
      prevState = sync.state
    }))

    unbind.push(sync.on('error', function (err) {
      if (err.type === 'wrong-protocol' || err.type === 'wrong-subprotocol') {
        setIcon(icon, icons.attention)
        message.innerHTML = messages.protocolError
        setInlineStyle(widget, normal)
      } else {
        setIcon(icon, icons.error)
        message.innerHTML = messages.serverError
        setInlineStyle(widget, error)
      }
      setInlineStyle(widget, visible)
    }))
  }

  return function () {
    for (var i = 0; i < unbind.length; i++) {
      unbind[i]()
    }
    document.body.removeChild(document.getElementById(widget.id))
  }
}

module.exports = badge

var attention = require('./attention.svg')
var error = require('./error.svg')
var refresh = require('./refresh.svg')
var success = require('./success.svg')

module.exports = {
  icons: {
    disconnected: attention,
    wait: attention,
    connecting: refresh,
    sending: refresh,
    synchronized: success,
    protocolError: attention,
    serverError: error
  },
  widget: {
    position: 'fixed',
    display: 'flex',
    fontSize: '13px',
    width: '19.231em',
    height: '3.8462em',
    margin: '1em',
    borderRadius: '0.3846em',
    boxSizing: 'border-box',
    alignItems: 'center',
    color: '#ffffff',
    background: '#000000',
    opacity: '0.8',
    zIndex: 999,
    fontFamily: 'Helvetica Neue, Lucida Grande, Helvetica, Arial, sans-serif',
    fontWeight: '400',
    fontStyle: 'normal',
    fontVariant: 'normal',
    textAlign: 'left',
    textIndent: '0',
    textTransform: 'none',
    wordSpacing: 'normal',
    letterSpacing: 'normal',
    lineHeight: 'auto'
  },
  icon: {
    display: 'block',
    width: '3.8462em',
    height: '3.8462em',
    margin: 0,
    marginRight: '0.15385em',
    padding: 0,
    boxSizing: 'border-box',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center center',
    backgroundSize: '1.8462em 1.8462em',
    order: -1
  },
  normal: {
    background: '#000000'
  },
  error: {
    background: '#f32a2a'
  },
  timeout: 2000
}

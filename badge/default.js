var attention = require('./attention.svg')
var error = require('./error.svg')
var sending = require('./sending.svg')
var success = require('./success.svg')

module.exports = {
  icons: {
    attention: attention,
    error: error,
    sending: sending,
    success: success
  },
  widget: {
    position: 'fixed',
    zIndex: 999,
    display: 'flex',
    width: '250px',
    margin: '10px',
    padding: '15px',
    borderRadius: '5px',
    boxSizing: 'border-box',
    alignItems: 'center',
    opacity: 0,
    color: '#ffffff',
    textAlign: 'left',
    fontSize: '13px',
    fontWeight: 'normal',
    fontStyle: 'normal',
    fontVariant: 'normal',
    fontFamily: 'Helvetica Neue, sans-serif',
    textIndent: '0',
    textTransform: 'none',
    wordSpacing: 'normal',
    letterSpacing: 'normal',
    lineHeight: 'auto'
  },
  icon: {
    display: 'block',
    margin: 0,
    padding: 0,
    marginRight: '0.8em',
    width: '2em',
    height: '2em',
    boxSizing: 'border-box',
    order: -1,
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'contain'
  },
  normal: {
    background: '#1f1f1f'
  },
  error: {
    background: '#e04041'
  },
  hidden: {
    opacity: 0
  },
  visible: {
    opacity: 1
  },
  timeout: 2000
}

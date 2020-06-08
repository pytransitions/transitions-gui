import WebMachine from './modules/machine'

class App {
  constructor () {
    this.ws = new WebSocket(`ws://${document.location.host}/ws`)
    this.ws.onopen = function () { console.log('Open Websocket') }
    this.ws.onclose = function () { console.log('Websocket Closed') }
    this.ws.onmessage = evt => this.onMessageReceived(evt)
    document.getElementById('layoutButton').addEventListener('click', evt => this.onLayoutClicked(evt))
    document.getElementById('saveButton').addEventListener('click', evt => this.webMachine.saveLayout())
  }

  onMessageReceived (evt) {
    try {
      const msg = JSON.parse(evt.data)
      const _this = this
      switch (msg.method) {
        case 'update_machine':
          this.webMachine = new WebMachine(msg.arg, getURLParameter('layout'), getURLParameter('details'))
          this.webMachine.cy.on('tap', 'edge', function (evt) {
            if (_this.webMachine.cy.autolock()) {
              _this.ws.send(JSON.stringify({
                method: 'trigger',
                arg: evt.target.data('trigger')
              }))
            }
          })
          this.webMachine.selectState(msg.arg.models[0].state)
          break
        case 'state_changed':
          if (this.webMachine !== undefined) {
            this.webMachine.cy.$('.current').removeClass('current')
            this.webMachine.selectTransition(msg.arg.transition)
            this.webMachine.selectState(msg.arg.state)
          }
          break
      }
    } catch (err) {
      console.log('ERROR: ', err)
    }
  }

  onLayoutClicked (evt) {
    console.log(this)
    let elem = evt.target
    elem.classList.toggle('unlocked')
    this.webMachine.cy.autolock(!elem.classList.contains('unlocked'))
  }
}

// http://stackoverflow.com/a/11582513/1617563
function getURLParameter (name) {
  return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [null, ''])[1].replace(/\+/g, '%20')) || null
}

function init () {
  window.app = new App()
}

window.onload = init

import convert from './convert'
import initGraph from './graph'
import config from './config'

export default class WebMachine {
  constructor (transitionsMarkup, layout, details) {
    let machine = convert(transitionsMarkup, details || false)
    this.machineName = machine.name
    layout = config.layouts[layout]
    if (layout === undefined) {
      layout = this.loadLayout(machine.name) || (isCompound(machine.nodes)
        ? config.layouts.dagre : config.layouts.concentric)
    }
    this.cy = initGraph(machine.nodes, machine.edges, layout)
  }

  loadLayout () {
    if (this.machineName.length > 0) {
      let machineStorage = localStorage.getItem(config.machineStorageLocation)
      if (machineStorage != null) {
        machineStorage = JSON.parse(machineStorage)
        if (machineStorage.hasOwnProperty(this.machineName)) {
          // console.log(machineStorage[this.machineName])
          return {
            name: 'preset',
            positions: machineStorage[this.machineName]
          }
        }
      }
    }
    return undefined
  }

  saveLayout () {
    var posMap = {}
    this.cy.nodes().forEach(function (node) {
      posMap[node.data('id')] = node.position()
    })
    let machineStorage = localStorage.getItem(config.machineStorageLocation)
    try {
      machineStorage = JSON.parse(machineStorage)
      if (typeof machineStorage === 'object') {
        machineStorage[this.machineName] = posMap
      } else {
        throw Error(`Expected 'machineStorage' to be of type object but found ${typeof machineStorage}`)
      }
    } catch (err) {
      machineStorage = { [this.machineName]: posMap }
    }
    // console.log(machineStorage)
    localStorage.setItem(config.machineStorageLocation, JSON.stringify(machineStorage))
  }

  selectState (state) {
    const states = (Array.isArray(state)) ? state : [state]
    states.forEach(stateName => {
      this.cy.getElementById(stateName).addClass('current')
    })
  }

  selectTransition (transition) {
    // console.log(transition)
    const source = this.cy.nodes(`[id="${transition.source}"]`)
    let edge = source.connectedEdges(`[trigger="${transition.trigger}"]`)
    if (edge.length > 1) {
      edge = edge.filter(`[source="${transition.source}"]`)
    }
    // console.log(edge.length)
    if (edge.length > 0) {
      edge = edge[0]
      edge.addClass('current')
    }
  }
}

function isCompound (nodes) {
  nodes.forEach(function (node) {
    if (node.hasOwnProperty('parent')) { return true }
  })
  return false
}

import convert from './convert'
import {initGraph, initLegend} from './graph'
import config from './config'

export default class WebMachine {
  constructor (transitionsMarkup, layout, details, style) {
    this.modelClasses = {}
    this.modelStates = {}
    this.modelTransitions = {}
    this.style = style
    let machine = convert(transitionsMarkup, details || false)
    this.machineName = machine.name
    layout = config.layouts[layout]
    if (layout === undefined) {
      layout = this.loadLayout(machine.name) || (isCompound(machine.nodes)
        ? config.layouts.dagre : config.layouts.concentric)
    }
    this.cy = initGraph(machine.nodes, machine.edges, layout, this.style)
    let legendEntries = []
    transitionsMarkup.models.forEach(model => {
      this.modelClasses[model.name] = model['class-name'].replace(/\W/g, '')
      this.modelStates[model.name] = []
      this.modelTransitions[model.name] = []
      this.selectState(model.name, model.state)
      legendEntries.push({name: model.name, class: model['class-name'].replace(/\W/g, ''), state: model.state})
    });
    this.updateLegend(legendEntries)
  }

  updateLegend(entries) {
    let nodes = []
    entries.forEach(entry => {
      const states = (Array.isArray(entry.state)) ? entry.state : [entry.state]
      nodes.push({data: {
        id: entry.name,
        label: `${entry.name} <${entry.class}>\nState: ${states.join(', ')}`},
        classes: [entry.class, entry.name]})
    })
    if (nodes.length > 1) {
      document.getElementById('legend').style.display = null
      this.cyLegend = initLegend(nodes, this.style)
    } else {
      document.getElementById('legend').style.display = 'none'
    }
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

  selectState (modelName, state) {
    let escapedName = modelName.replace(/\W/g, '')
    // console.log(this.modelStates)
    this.modelStates[modelName].forEach(node => {
      node.removeClass('currentState')
      node.removeClass(escapedName)
      node.removeClass(this.modelClasses[modelName])
      // console.log(node)
    })
    const states = (Array.isArray(state)) ? state : [state]
    this.modelStates[modelName] = states.map(stateName => { return this.cy.getElementById(stateName) })
    // console.log(this.modelStates[modelName])
    this.modelStates[modelName].forEach(node => {
      node.addClass('currentState')
      node.addClass(escapedName)
      node.addClass(this.modelClasses[modelName])
    })
    if (this.cyLegend) {
      this.cyLegend.nodes(`#${modelName}`).css({content: `${modelName} <${this.modelClasses[modelName]}>\nState: ${states.join(', ')}`})
    }
  }

  selectTransition (modelName, transition) {
    // console.log(this.modelTransitions)
    // console.log(modelName)
    // console.log(this.modelTransitions[modelName])
    this.modelTransitions[modelName].forEach(edge => {
      edge.removeClass('currentTransition')
    })
    // console.log(transition)
    const source = this.cy.nodes(`[id="${transition.source}"]`)
    let edge = source.connectedEdges(`[trigger="${transition.trigger}"]`)
    if (edge.length > 1) {
      edge = edge.filter(`[source="${transition.source}"]`)
      if (edge.length > 1) {
        edge = edge.filter(`[target="${transition.dest}"]`)
      }
    }
    // console.log(edge.length)
    if (edge.length > 0) {
      edge = edge[0]
      edge.addClass('currentTransition')
      this.modelTransitions[modelName] = [edge] 
    }
  }
}

function isCompound (nodes) {
  nodes.forEach(function (node) {
    if (node.hasOwnProperty('parent')) { return true }
  })
  return false
}

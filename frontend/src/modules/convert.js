export default function convert (transitionsMarkup) {
  let nodes = transitionsMarkup.states.map(state => state2Node(state)).flat()
  let edges = transitionsMarkup.states.map(state => initial2Edges(state)).flat()
  edges = edges.concat(transitionsMarkup.transitions.map(transition => transitions2Edges(transition)).flat())
  return {
    name: transitionsMarkup.name,
    nodes: nodes,
    edges: edges
  }
}

function state2Node (state, parent) {
  let data = { 'id': state.name }
  let children = []
  let parallel = []
  if (parent) {
    data.parent = parent
    data.id = `${parent}_${data.id}`
  }

  if (state.hasOwnProperty('children')) {
    children = state.children.map(state => state2Node(state, data.id)).flat()
    let init = { 'data': { 'data': `init_${data.id}` } }
    if (parent) {
      init.data.parent = data.id
    }
    children.push(init)
  }

  if (state.hasOwnProperty('parallel')) {
    parallel = state.parallel.map(state => state2Node(state, data.id, true)).flat()
    data.parallel = true
  }

  let nodes = [{ 'data': data }]
  return nodes.concat(children).concat(parallel)
}

function initial2Edges (state, prefix) {
  prefix = prefix || ''
  let fullName = prefix + state.name
  let edges = []

  if (state.hasOwnProperty('initial')) {
    edges.push({
      'data': {
        'source': `init_${fullName}`,
        'target': `${fullName}_${state.initial}`,
        'label': 'initial' }
    })
  }

  if (state.hasOwnProperty('children')) {
    edges = edges.concat(state.children.map(state => initial2Edges(state, fullName + '_')).flat())
  }

  if (state.hasOwnProperty('parallel')) {
    edges = edges.concat(state.parallel.map(state => initial2Edges(state, fullName + '_')).flat())
  }
  return edges
}

function transitions2Edges (transition) {
  var edges = [{ 'data': {
    'source': transition.source,
    'target': transition.dest,
    'label': transition.label || transition.trigger,
    'trigger': transition.trigger
  } }]
  return edges
}

export default function convert (transitionsMarkup, details) {
  details = details || false
  let nodes = transitionsMarkup.states.map(state => state2Node(state, undefined, details)).flat()
  let edges = transitionsMarkup.states.map(state => initial2Edges(state)).flat()
  edges = edges.concat(transitionsMarkup.transitions.map(transition => transitions2Edges(transition, details)).flat())
  return {
    name: transitionsMarkup.name,
    nodes: nodes,
    edges: edges
  }
}

function state2Node (state, parent, details) {
  const node = { data: { id: state.name, label: state.name } }
  let children = []
  let parallel = []
  if (parent) {
    node.data.parent = parent
    node.data.id = `${parent}_${node.data.id}`
  }

  if (state.hasOwnProperty('children')) {
    children = state.children.map(state => state2Node(state, node.data.id, details)).flat()
    const init = { data: { data: `init_${node.data.id}` } }
    if (parent) {
      init.data.parent = node.data.id
    }
    children.push(init)
  } else if (state.hasOwnProperty('parallel')) {
    parallel = state.parallel.map(state => state2Node(state, node.data.id, details)).flat()
    node.data.parallel = true
  }

  if (details) {
    if (state.hasOwnProperty('on_enter')) {
      node.classes = node.classes || []
      node.classes.push('multiline')
      node.data.label += '\n- enter:'
      state.on_enter.forEach(cb => {
        node.data.label += `\n  + ${cb}`
      })
    }

    if (state.hasOwnProperty('on_exit')) {
      node.classes = node.classes || []
      node.classes.push('multiline')
      node.data.label += '\n- exit:'
      state.on_exit.forEach(cb => {
        node.data.label += `\n  + ${cb}`
      })
    }
  }

  const nodes = [node]
  return nodes.concat(children).concat(parallel)
}

function initial2Edges (state, prefix) {
  prefix = prefix || ''
  const fullName = prefix + state.name
  let edges = []

  if (state.hasOwnProperty('initial')) {
    edges.push({
      data: {
        source: `init_${fullName}`,
        target: `${fullName}_${state.initial}`,
        label: 'initial' }
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

function transitions2Edges (transition, details) {
  let label = transition.label || transition.trigger

  if (details && (transition.conditions || transition.unless)) {
    label += ' ['
    const cons = transition.conditions || []
    const unless = transition.unless || []
    cons.forEach(co => {
      label += co + ' & '
    })
    unless.forEach(co => {
      label += '!' + co + ' & '
    })
    label = label.slice(0, -3) // slice last ' & '
    label += ']'
  }

  if (!transition.dest) {
    transition.dest = transition.source
    label += ' [internal]'
  }

  const edges = [
    {
      data: {
        source: transition.source,
        target: transition.dest,
        label: label,
        trigger: transition.trigger
      }
    }]
  return edges
}

export default function convert (transitionsMarkup, details) {
  details = details || false
  const tmp = transitionsMarkup.states.map(state => state2Node(state, undefined, details)).flat()
  const res = { nodes: [], edges: [] }
  tmp.forEach(elem => {
    res.nodes.push(...elem.nodes)
    res.edges.push(...elem.edges)
  })
  res.edges = res.edges.concat(transitionsMarkup.states.map(state => initial2Edges(state)).flat())
  res.edges = res.edges.concat(transitionsMarkup.transitions.map(transition => transitions2Edges(transition, undefined, details)).flat())
  return {
    name: transitionsMarkup.name,
    nodes: res.nodes,
    edges: res.edges
  }
}

function state2Node (state, parent, details) {
  const node = { data: { id: state.name, label: state.name } }
  let childRes = { nodes: [], edges: [] }
  let edges = []
  if (parent) {
    node.data.parent = parent
    node.data.id = `${parent}_${node.data.id}`
  }

  if (state.children) {
    childRes = state.children.map(state => state2Node(state, node.data.id, details)).flat()
    if (Array.isArray(state.initial)) {
      node.data.parallel = true
    } else if (state.initial) {
      const init = { data: { id: `init_${node.data.id}` } }
      init.data.parent = node.data.id
      childRes.push({ nodes: [init], edges: [] })
    }
  }

  if (details) {
    node.classes = node.classes || []

    if (state.tags) {
      node.data.label += ' [' + state.tags.join(', ') + ']'
    }

    if (state.on_enter) {
      node.classes.push('multiline')
      node.data.label += '\n- enter:'
      state.on_enter.forEach(cb => {
        node.data.label += `\n  + ${cb}`
      })
    }

    if (state.on_exit) {
      node.classes.push('multiline')
      node.data.label += '\n- exit:'
      state.on_exit.forEach(cb => {
        node.data.label += `\n  + ${cb}`
      })
    }

    if (state.timeout) {
      node.classes.push('multiline')
      node.data.label += `\n- timeout(${state.timeout}s) → (${state.on_timeout.join(', ')})`
    }
  }

  if (state.transitions) {
    edges = state.transitions.map(transition => transitions2Edges(transition, node.data.id, details)).flat()
  }
  return [{ nodes: [node], edges: edges }].concat(childRes)
}

function initial2Edges (state, prefix) {
  prefix = prefix || ''
  const fullName = prefix + state.name
  let edges = []

  if (state.initial && !Array.isArray(state.initial)) {
    edges.push({
      data: {
        source: `init_${fullName}`,
        target: `${fullName}_${state.initial}`,
        label: 'initial'
      }
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

function transitions2Edges (transition, prefix, details) {
  let label = transition.label || transition.trigger

  if (details && (transition.conditions || transition.unless)) {
    label += ' ['
    const arr = transition.conditions || []
    const unless = transition.unless || []
    unless.forEach(co => {
      arr.push('!' + co)
    })
    label += arr.join(' & ')
    label += ']'
  }

  if (!transition.dest) {
    transition.dest = transition.source
    label += ' [internal]'
  }

  if (prefix) {
    transition.source = `${prefix}_${transition.source}`
    transition.dest = `${prefix}_${transition.dest}`
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

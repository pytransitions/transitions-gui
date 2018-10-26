var config = {
  layouts: {
    concentric: { name: 'concentric', minNodeSpacing: 100 },
    dagre: { name: 'dagre', ranker: 'tight-tree' },
    bilkent: { name: 'cose-bilkent', idealEdgeLength: 100 }
  },
  machineStorageLocation: 'transitions.layouts.machines'
}

export default config

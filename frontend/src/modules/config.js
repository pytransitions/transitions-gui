var config = {
  layouts: {
    concentric: { name: 'concentric', minNodeSpacing: 100 },
    dagre: {
      name: 'dagre', ranker: 'tight-tree', avoidOverlap: true,
      nodeDimensionsIncludeLabels: true
    },
    bilkent: { name: 'cose-bilkent', idealEdgeLength: 100 }
  },
  machineStorageLocation: 'transitions.layouts.machines'
}

export default config

import cytoscape from 'cytoscape'
import cydagre from 'cytoscape-dagre'
import cybilken from 'cytoscape-cose-bilkent'

cydagre(cytoscape)
cybilken(cytoscape)

let defaultStyleLegend = [
  {
    selector: 'node',
    style: {
      'label': 'data(label)',
      'text-valign': 'center',
      'text-halign': 'right',
      'text-wrap': 'wrap',
      'border-width': '1',
      'border-color': 'black',
      'background-color': '#fff',
      'shape': 'ellipse',
      'width': '20px',
      'height': '20px',
      'text-margin-x': '1em',
      'font-size': '1.5em'
    }
  }
]

let defaultStyle = [
  {
    selector: 'node',
    style: {
      'label': 'data(label)',
      'text-valign': 'center',
      'text-halign': 'center',
      'text-wrap': 'wrap',
      'border-width': '2',
      'border-color': 'black',
      'background-color': '#fff',
      'shape': 'roundrectangle',
      'padding-top': '5px',
      'padding-left': '10px',
      'padding-bottom': '5px',
      'padding-right': '10px',
      'width': 'label',
      'height': 'label'
    }
  },
  {
    selector: '$node > node',
    style: {
      'padding-top': '10px',
      'padding-left': '10px',
      'padding-bottom': '10px',
      'padding-right': '10px',
      'text-valign': 'top'
    }
  },
  {
    selector: 'node[parallel]',
    style: {
      'background-opacity': 0,
      'background-image': function(ele) {
        return renderParallel(ele).svg
      }
    }
  },
  {
    selector: 'node[parallel] > node',
    style: {
      'background-opacity': 0
    }
  },
  {
    selector: 'node[id ^="init_"]',
    style: {
      'width': '5px',
      'height': '5px',
      'background-color': 'black',
      'shape': 'ellipse',
      'label': ''
    }
  },
  {
    selector: 'edge',
    css: {
      'target-arrow-shape': 'triangle',
      'label': 'data(label)',
      'line-color': 'black',
      'curve-style': 'bezier',
      'target-arrow-color': 'black',
      'text-background-opacity': 1,
      'text-background-color': '#fff',
      'text-background-padding': 5,
      'text-rotation': 'autorotate',
      'source-text-rotation': 'autorotate',
      'target-text-rotation': 'autorotate',
    }
  },
  {
    selector: 'edge:loop',
    style: {
      'loop-sweep': '60deg',
      'loop-direction': '0deg',
      'control-point-step-size': '50px'
    }
  },
  {
    selector: ':active',
    style: {
      'line-color': 'red',
      'border-opacity': 1,
      'target-arrow-color': 'red',
      'source-arrow-color': 'red',
      'border-color': 'red'
    }
  },
  {
    selector: '.currentState',
    style: {
      'background-color': '#faa',
      'border-style': 'double',
      'border-color': '#f00',
    }
  },
  {
    selector: '.currentTransition',
    style: {
      'background-color': '#faa',
      'border-style': 'double',
      'border-color': '#f00',
      'line-color': '#faa',
      'target-arrow-color': '#faa',
      'source-arrow-color': '#faa'
    }
  },
  {
    selector: 'node.multiline',
    style: {
      'text-justification': 'left',
      'text-wrap': 'wrap'
    }
  }
]

export function initGraph (nodes, edges, layout, style) {
  style = style || []
  // console.log(layout)
  const cy = cytoscape({
    container: document.getElementById('cy'),
    boxSelectionEnabled: false,
    autounselectify: true,
    style: defaultStyle.concat(style),
    elements: {
      nodes: nodes,
      edges: edges
    }
  })

  cy.edges(':loop').forEach(edge => {
    const node = edge.source()
    if (node.hasClass('multiline')) {
      edge.css('control-point-step-size', 50 + 5 * node.css('label').split('\n').length)
    }
  })

  layout.stop = function () {
    cy.autolock(true)
  }
  cy.layout(layout).run()
  return cy
}

export function initLegend(nodes, style) {
  const cyLeg = cytoscape({
    container: document.getElementById('legend'),
    boxSelectionEnabled: false,
    autounselectify: true,
    layout: {
      name: 'grid',
      cols: 1
    },
    style: defaultStyleLegend.concat(style),
    elements: {
      nodes: nodes
    }
  })
  cyLeg.autolock(true)
  return cyLeg
}

const emptySvg = 'data:image/svg+xml,' + encodeURIComponent(`
<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE svg>
    <svg xmlns="http://www.w3.org/2000/svg">
</svg>`)

function renderParallel (ele) {
  if (!ele || !ele._private.autoWidth) {
    return {svg: emptySvg}
  }
  const width = ele._private.autoWidth
  const height = ele._private.autoHeight + 20
  const pos = ele._private.position
  const left = pos.x - width / 2
  const top = pos.y - height / 2
  let lines = ""
  if (ele._private.children.length > 1) {
    if (height > width) {
      const cPosX = ele._private.children.map(c => c._private.position.x).sort(function (a, b) { return a - b })
      for (let i = 1; i < cPosX.length; ++i) {
        const x = (Math.abs(cPosX[i - 1] + cPosX[i] - 2 * left)) / 2
        lines += `<line x1="${x}" y1="0" x2="${x}" y2="${height}" stroke="black" stroke-dasharray="4, 4" />\n`
      }
    } else {
      var cPosY = ele._private.children.map(c => c._private.position.y).sort(function (a, b) { return a - b })
      for (let i = 1; i < cPosY.length; ++i) {
        const y = (Math.abs(cPosY[i - 1] + cPosY[i] - 2 * top)) / 2
        lines += `<line x1="0" y1="${y}" x2="${width}" y2="${y}" stroke="black" stroke-dasharray="4, 4" />\n`
      }
    }
  }
  const svg = `<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE svg>
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    ${lines}
    </svg>`
    // console.log(svg)
  return {svg: 'data:image/svg+xml,' + encodeURIComponent(svg), width: width, height: height}
}

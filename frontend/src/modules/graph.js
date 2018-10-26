import cytoscape from 'cytoscape'
import cydagre from 'cytoscape-dagre'
import cybilken from 'cytoscape-cose-bilkent'

cydagre(cytoscape)
cybilken(cytoscape)

export default function initGraph (nodes, edges, layout) {
  // console.log(layout)
  let cy = cytoscape({
    container: document.getElementById('cy'),
    boxSelectionEnabled: false,
    autounselectify: true,
    style: [
      {
        selector: 'node',
        css: {
          'content': 'data(id)',
          'text-valign': 'center',
          'text-halign': 'center',
          'border-width' : '2',
          'border-color' : 'black',
          'background-color': '#fff',
          'shape': 'roundrectangle',
          'padding-top': '5px',
          'padding-left': '10px',
          'padding-bottom': '5px',
          'padding-right': '10px',
          'width': 'label'
        }
      },
      {
        selector: '$node > node',
        css: {
          'padding-top': '10px',
          'padding-left': '10px',
          'padding-bottom': '10px',
          'padding-right': '10px',
          'text-valign': 'top',
        },
      },
      {
        selector: 'node[parallel]',
        css: {
          // 'border-opacity': 0,
          'background-opacity': 0,
          'background-image': renderParallel
        }
      },
      {
        selector: 'node[parallel] > node',
        css: {
          // 'border-opacity': 0,
          'background-opacity': 0
        }
      },
      {
        selector: 'node[id ^="init_"]',
        css: {
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
          'text-background-padding': 5
        }
      },
      {
        selector: 'edge:loop.compoundLoop',
        css: {
          'curve-style': 'unbundled-bezier',
          'control-point-distances': 180,
          'loop-sweep': 45
        }
      },
      {
        selector: ':active',
        css: {
          'line-color': 'red',
          'border-opacity': 1,
          'target-arrow-color': 'red',
          'source-arrow-color': 'red',
          'border-color' : 'red',
        }
      },
      {
        selector: '.current',
        css: {
          'background-color': '#faa',
          'border-style': 'double',
          'border-color': '#f00',
          'line-color': '#faa',
          'target-arrow-color': '#faa',
          'source-arrow-color': '#faa',
        }
      }
    ],

    elements: {
      nodes: nodes,
      edges: edges
    },
  })

  layout.stop = function () {
    cy.autolock(true)
  }
  cy.layout(layout).run()
  return cy
}

function renderParallel (ele) {
  // var label     = ele.data('label')
  // var icon      = ele.data('icon')
  // var iconColor = ele.data('iconColor')
  var width = ele._private.autoWidth
  if (width === undefined) {
    return ele
  }
  var height = ele._private.autoHeight + 20
  var pos = ele._private.position
  var left = pos.x - width / 2
  if (ele._private.children.length > 1) {
    var cPosX = ele._private.children.map(c => c._private.position.x).sort(function (a, b) {return a - b})
    // console.log(cPosX)
    var lines = ''
    for (let i = 1; i < cPosX.length; ++i) {
      let x = (Math.abs(cPosX[i - 1] + cPosX[i] - 2 * left)) / 2
      lines += `<line x1="${x}" y1="0" x2="${x}" y2="${height}" stroke="black" stroke-dasharray="4, 4" />\n`
    }
    var svg = `<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE svg>
        <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" stroke-width="2">
        ${lines}
        </svg>`
    // console.log(svg)
    var payload = 'data:image/svg+xml,' + encodeURIComponent(svg)
    // console.log(payload)
    return payload
  }
  return ele
}
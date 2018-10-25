// var state_machine_json = {
//     "states": [{"name": "A"}, {"name": "B"},
//     {"name": "C", "parallel": [{"name": "1"}, {"name": "2"}, {"name": "3", "initial": "a", "children": [{"name": "a"}]}]}],
//     "transitions": [{"trigger": "go", "source": "A", "dest": "B"},
//     {"trigger": "go", "source": "B", "dest": "C"},
//     {"trigger": "go", "source": "C_1", "dest": "C_3_a"}]
// }

function trans2Cyto(machine) {
    var nodes = []
    var nodes = machine['states'].map(state => state2Node(state)).flat()
    var edges = machine['states'].map(state => initial2Edges(state)).flat()
    edges = edges.concat(machine['transitions'].map(transition => transitions2Edges(transition)).flat())
    return [nodes, edges]
}


function state2Node(state, parent, isParallel) {
    var data = {"id": state['name']}
    var children = []
    var parallel = []
    if (parent) {
        data['parent'] = parent
        data['id'] = parent + "_" + data['id']
    }
    if (state.hasOwnProperty('children')) {
        children = state['children'].map(state => state2Node(state, data['id'])).flat()
        var init = {"data": {"id": "init_" + data['id']}}
        if (parent) {
            init['data']['parent'] = data['id']
        }
        children.push(init)
    }
    if (state.hasOwnProperty('parallel')) {
        parallel = state['parallel'].map(state => state2Node(state, data['id'],  true)).flat()
        data['parallel'] = true
    }
    var nodes  = [{"data": data}]
    // if (isParallel) {
    //   nodes.push({"data": {"id": "init_" + data['id'], "parent": data['id']}})
    // }
    return nodes.concat(children).concat(parallel)
}

function initial2Edges(state, prefix) {
    prefix = prefix || "" 
    var fullName = prefix + state['name']
    var edges = []
    if(state.hasOwnProperty('initial')) {
        edges.push({"data": {"source": "init_" + fullName, "target": fullName + "_" + state['initial'], "label": "initial"}})
    }
    if (state.hasOwnProperty('children')) {
        edges = edges.concat(state['children'].map(state => initial2Edges(state, fullName + "_")).flat())
    }
    if (state.hasOwnProperty('parallel')) {
        edges = edges.concat(state['parallel'].map(state => initial2Edges(state, fullName + "_")).flat())
    }
    return edges
}

function transitions2Edges(transition) {
    var edges = [{"data":{"source": transition['source'], "target": transition['dest'],
                  "label": transition['label'] || transition['trigger'], "trigger": transition['trigger']}}] 
    return edges
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
    var left = pos.x - width/2
    if (ele._private.children.length > 1) {
        var cPosX = ele._private.children.map(c => c._private.position.x).sort(function(a, b){return a-b})
        // console.log(cPosX)
        var lines = ''
        for (let i = 1; i < cPosX.length; ++i) {
            let x = (Math.abs(cPosX[i-1] + cPosX[i] - 2 * left)) / 2
            lines += `<line x1="${x}" y1="0" x2="${x}" y2="${height}" stroke="black" stroke-dasharray="4, 4" />\n`
        }
        var svg = `<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE svg>
        <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" stroke-width="2">
        ${lines}
        </svg>`
        // console.log(svg)
        var payload = 'data:image/svg+xml,' + encodeURIComponent(svg)
        //console.log(payload)
        return payload
    }
    return ele
}

function initGraph(state_machine_json){
    var res = trans2Cyto(state_machine_json)

    window.cy = cytoscape({
        container: document.getElementById('cy'),
        
        boxSelectionEnabled: false,
        autounselectify: true,
        
        layout: {
            name: 'dagre',
            ranker: 'tight-tree'
            // idealEdgeLength: 100,
            // name: 'cose-bilkent',
            // randomize: true,
        },
        
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
            nodes: res[0],
            edges: res[1]
        },
    });

    cy.autolock(true)

    cy.on('tap', 'edge', function(evt){
        if (cy.autolock()) {
            ws.send(JSON.stringify({"method": "trigger", "arg": evt.target.data('trigger')}));
        }
    });
}

function onLayoutClicked(elem) {
    if (elem.classList.contains('locked')) {
        elem.textContent = "Layout: unlocked"
    } else {
        elem.textContent = "Layout: locked"
    }
    elem.classList.toggle('locked')
    cy.autolock(elem.classList.contains('locked'))
}

function selectState(state) {
    var node = cy.getElementById(state)
    node.addClass('current')
}
    
function selectTransition(transition) {
    console.log(transition)
    var edge = cy.edges("#"+ transition.source + " -> " + "#" + transition.dest)
    console.log(edge.length)
    if (edge.length > 1 && transition.trigger) {
        edge = edge.filter("[label = '" + transition.trigger + "']")
    }
    if (edge.length > 0) {
        edge = edge[0]
        cy.$('.current').classes()
        edge.target().addClass('current')
        edge.addClass('current')
    }
}

window.ws = new WebSocket("ws://localhost:8080/ws");
ws.onopen = function() {
   console.log("Websocket connection opened")
};

ws.onmessage = function (evt) {
    var msg = JSON.parse(evt.data)
    console.log(msg)
    if (msg.method == "update_machine") {
        initGraph(msg.arg)
    } else if (msg.method == "state_changed") {
        selectTransition(msg.arg.transition)
    }
};


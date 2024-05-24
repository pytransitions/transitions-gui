import sys
import time
from os.path import join, realpath, dirname
import logging

sys.path.append(join(dirname(realpath(__file__)), ".."))

from transitions_gui import WebMachine

logging.basicConfig(level=logging.INFO)

# just a simple state machine setup
states = ["Red", "Yellow", "Green"]
transitions = [
    ["tick", "Red", "Green"],
    ["tick", "Green", "Yellow"],
    ["tick", "Yellow", "Red"],
    ["reset", "*", "Red"]
]

# Check https://js.cytoscape.org/#selectors and https://js.cytoscape.org/#style for more options
styling = [
    {"selector": 'node[id = "Green"]',  # state names are equal to node IDs
     "css": {"font-size": 28, "color": "white", "background-color": "darkgreen"}},
    {"selector": 'node[id = "Red"]',
     "css": {"shape": "ellipse", "color": "darkred"}},
    {"selector": 'node[id != "Green"]',  # select all nodes EXCEPT green
     "css": {"border-style": "dotted"}},
    {"selector": "edge",  # select all edges
     "css": {"font-size": 12, "text-margin-y": -12, "text-background-opacity": 0}},
    {"selector": 'edge[source = "Red"][target = "Green"]',  # select all edges from Red to Green
     "css": {"line-gradient-stop-colors": "red yellow black", "line-fill": "linear-gradient"}},
    {"selector": 'edge[label = "reset"]',  # transition triggers map to edge labels (without conditions)
     "css": {"line-style": "dotted", "target-arrow-shape": "triangle-tee"}}
]

machine = WebMachine(
    states=states,
    transitions=transitions,
    initial="Red",
    name="Traffic Machine",
    ignore_invalid_triggers=True,
    auto_transitions=False,
    graph_css=styling,
)

try:
    while True:
        time.sleep(5)
        machine.tick()
except KeyboardInterrupt:  # Ctrl + C will shutdown the machine
    machine.stop_server()

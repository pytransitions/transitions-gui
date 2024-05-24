from transitions_gui import NestedWebMachine
from time import sleep

states = [
    {"name": "PumpON", "states": ["SwitchOFF", "SwitchON"], "initial": "SwitchOFF"},
    {"name": "PumpOFF", "states": ["SwitchOFF", "SwitchON"], "initial": "SwitchOFF"},
]

transitions = [
    ["button_pressed", "PumpON_SwitchOFF", "PumpOFF_SwitchOFF"],
    ["button_pressed", "PumpON_SwitchON", "PumpOFF_SwitchON"],
    ["button_pressed", "PumpOFF_SwitchOFF", "PumpON_SwitchOFF"],
    ["button_pressed", "PumpOFF_SwitchON", "PumpON_SwitchON"],
    ["button_switched", "PumpON_SwitchOFF", "PumpOFF_SwitchON"],
    ["button_switched", "PumpON_SwitchON", "PumpOFF_SwitchOFF"],
    ["switch_toggled", "PumpOFF_SwitchOFF", "PumpON_SwitchON"],
    ["switch_toggled", "PumpON_SwitchOFF", "PumpOFF_SwitchON"],
    ["switch_toggled", "PumpOFF_SwitchON", "PumpON_SwitchOFF"],
    ["switch_toggled", "PumpON_SwitchON", "PumpOFF_SwitchOFF"],
]

m = NestedWebMachine(states=states, transitions=transitions, auto_transitions=False, initial="PumpOFF",
                     graph_css=
                     [
                        {
                          "selector": 'edge[source *= "SwitchOFF"][target *= "SwitchON"],'
                                      'edge[source *= "SwitchON"][target *= "SwitchOFF"]',
                          "css": {
                              "label": "",
                              "source-text-offset": 90,
                              "source-label": "data(label)",
                          }
                        },
                         {
                             "selector": "edge",
                             "css": {
                                 "font-size": 12
                             }
                         }
                     ]
                     )

try:
    while True:
        sleep(5)
        m.button_pressed()
except KeyboardInterrupt:  # Ctrl + C will shutdown the machine
    m.stop_server()

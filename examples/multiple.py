import sys
import time
from os.path import join, realpath, dirname
import logging
import random

sys.path.append(join(dirname(realpath(__file__)), ".."))

from transitions_gui import WebMachine  # noqa

logging.basicConfig(level=logging.INFO)


class Agent:
    def __init__(self, name=None):
        if name is not None:
            self.name = name


class Soldier(Agent):
    pass


class Building(Agent):
    pass


agent_css = [
    {"selector": ".__main__Agent", "style": {"background-color": "DarkGray"}},
    {"selector": ".__main__Soldier", "style": {"background-color": "CadetBlue"}},
    {"selector": ".SgtBloom", "style": {"background-color": "FireBrick"}},
]

environment_css = [
    {"selector": ".__main__Building", "style": {"background-color": "DarkOrange"}},
    {"selector": ".Bunker", "style": {"background-color": "DarkGreen"}},
]

agent_states = ["Idle", "Patrol", "Chasing", "Searching"]
agent_transitions = [
    ["detect", ["Patrol", "Searching"], "Chasing"],
    ["lost", "Chasing", "Searching"],
    ["give_up", "Searching", "Patrol"],
    ["break", "Patrol", "Idle"],
    ["patrol", "Idle", "Patrol"],
]
agents = [Agent(), Soldier(), Soldier("SgtBloom")]

agent_machine = WebMachine(
    model=agents,
    states=agent_states,
    transitions=agent_transitions,
    initial="Idle",
    name="Agents",
    ignore_invalid_triggers=True,
    auto_transitions=False,
    graph_css=agent_css,
    port=8080,
)

environment_states = ["Locked", "Unlocked", "Open"]
environment_transitions = [
    ["unlock", "Locked", "Unlocked"],
    ["lock", "Unlocked", "Locked"],
    ["open", "Unlocked", "Open"],
    ["close", "Open", "Unlocked"],
]
buildings = [Building(), Building("Bunker")]

environment_machine = WebMachine(
    model=buildings,
    states=environment_states,
    transitions=environment_transitions,
    initial="Locked",
    name="Environment",
    ignore_invalid_triggers=True,
    auto_transitions=False,
    graph_css=environment_css,
    port=8081,
)

try:
    while True:
        for model in agents:
            time.sleep(1)
            next_action = random.choice(agent_transitions)
            model.trigger(next_action[0])
        for model in buildings:
            time.sleep(1)
            next_action = random.choice(environment_transitions)
            model.trigger(next_action[0])

except KeyboardInterrupt:  # Ctrl + C will shutdown the machine
    environment_machine.stop_server()
    agent_machine.stop_server()

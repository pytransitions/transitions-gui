import sys
import time
from os.path import join, realpath, dirname
import logging
from transitions.extensions.states import Timeout, Tags, add_state_features

sys.path.append(join(dirname(realpath(__file__)), '..'))

from transitions_gui import NestedWebMachine  # noqa


@add_state_features(Timeout, Tags)
class MyNestedWebMachine(NestedWebMachine):
    pass


logging.basicConfig(level=logging.INFO)


states = [{'name': 'caffeinated', 'on_enter': 'do_x', 'initial': 'dithering',
           'children': ['dithering', 'running'], 'transitions': [['drink', 'dithering', '=']]},
          {'name': 'standing', 'on_enter': ['do_x', 'do_y'], 'on_exit': 'do_z'},
          {'name': 'walking', 'tags': ['accepted', 'pending'], 'timeout': 5, 'on_timeout': 'do_z'}]

transitions = [
    ['walk', 'standing', 'walking'],
    ['go', 'standing', 'walking'],
    ['stop', 'walking', 'standing'],
    {'trigger': 'drink', 'source': '*', 'dest': 'caffeinated',
     'conditions': 'is_hot', 'unless': 'is_too_hot'},
    ['walk', 'caffeinated_dithering', 'caffeinated_running'],
    ['relax', 'caffeinated', 'standing'],
    ['sip', 'standing', 'caffeinated']
]


class Model:

    def is_hot(self):
        return True

    def is_too_hot(self):
        return False

    def do_x(self):
        pass


machine = MyNestedWebMachine(Model(), states=states, transitions=transitions, initial='new',
                             name="Mood Matrix",
                             ignore_invalid_triggers=True,
                             auto_transitions=False)

try:
    while True:
        time.sleep(5)
except KeyboardInterrupt:  # Ctrl + C will shutdown the machine
    machine.stop_server()

import sys
import time
from os.path import join, realpath, dirname
import logging

sys.path.append(join(dirname(realpath(__file__)), '..'))

from transitions_gui import WebMachine  # noqa

logging.basicConfig(level=logging.INFO)

transitions = [
    {'trigger': 'melt', 'source': 'solid', 'dest': 'liquid'},
    {'trigger': 'evaporate', 'source': 'liquid', 'dest': 'gas', 'conditions': 'is_valid'},
    {'trigger': 'sublimate', 'source': 'solid', 'dest': 'gas', 'unless': 'is_not_valid'},
    {'trigger': 'solidify', 'source': 'solid', 'dest': None},
    {'trigger': 'ionize', 'source': 'gas', 'dest': 'plasma',
     'conditions': ['is_valid', 'is_also_valid']}
]
states = ['solid', 'liquid', {'name': 'gas', 'on_exit': ['resume', 'notify']},
         {'name': 'plasma', 'on_enter': 'alert', 'on_exit': 'resume'}]


class Model:

    def resume(self):
        pass

    def is_valid(self):
        return True

    def is_also_valid(self):
        return self.is_valid()

    def is_not_valid(self):
        return False

    def resume(self):
        pass

    def notify(self):
        pass

    def alert(self):
        pass


machine = WebMachine(Model(), states=states, transitions=transitions, initial='solid',
                     name="Matter Machine",
                     ignore_invalid_triggers=True,
                     auto_transitions=False)

try:
    while True:
        time.sleep(5)
except KeyboardInterrupt:  # Ctrl + C will shutdown the machine
    machine.stop_server()

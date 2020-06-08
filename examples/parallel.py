import sys
import time
from os.path import join, realpath, dirname
import logging

sys.path.append(join(dirname(realpath(__file__)), '..'))

from transitions_gui import NestedWebMachine # noqa


logging.basicConfig(level=logging.INFO)


states = [{'name': 'style',
           'parallel': [
               {
                   'name': 'numbers',
                   'children': ['one', 'two', 'three'],
                   'transitions': [['inc', 'one', 'two'], ['inc', 'two', 'three']],
                   'initial': 'one'
               },
               {
                   'name': 'greek',
                   'children': ['alpha', 'beta', 'gamma'],
                   'transitions': [['inc', 'alpha', 'beta'], ['inc', 'beta', 'gamma']],
                   'initial': 'alpha'
               }]
           }, 'preparing']

transitions = [['go', 'preparing', 'style']]

machine = NestedWebMachine(states=states, transitions=transitions, initial='preparing',
                           name="Label Machine",
                           ignore_invalid_triggers=True,
                           auto_transitions=False)

try:
    while True:
        time.sleep(5)
except KeyboardInterrupt:  # Ctrl + C will shutdown the machine
    machine.stop_server()

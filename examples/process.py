import sys
import time
from os.path import join, realpath, dirname
import logging
from transitions.extensions.states import Timeout, Tags, add_state_features

sys.path.append(join(dirname(realpath(__file__)), '..'))

from transitions_gui import WebMachine  # noqa


@add_state_features(Timeout, Tags)
class CustomMachine(WebMachine):
    pass


logging.basicConfig(level=logging.INFO)

states = ['new', 'approved', 'ready', 'finished', 'provisioned',
          {'name': 'failed', 'on_enter': 'notify', 'on_exit': 'reset',
           'tags': ['error', 'urgent'], 'timeout': 10, 'on_timeout': 'shutdown'},
          'in_iv', 'initializing', 'booting', 'os_ready', {'name': 'testing', 'on_exit': 'create_report'},
          'provisioning']

transitions = [{'trigger': 'approve', 'source': ['new', 'testing'], 'dest':'approved',
                'conditions': 'is_valid', 'unless': 'abort_triggered'},
               ['fail', '*', 'failed'],
               ['add_to_iv', ['approved', 'failed'], 'in_iv'],
               ['create', ['failed', 'in_iv'], 'initializing'],
               ['init', 'in_iv', 'initializing'],
               ['finish', 'approved', 'finished'],
               ['boot', ['booting', 'initializing'], 'booting'],
               ['ready', ['booting', 'initializing'], 'os_ready'],
               ['run_checks', ['failed', 'os_ready'], 'testing'],
               ['provision', ['os_ready', 'failed'], 'provisioning'],
               ['provisioning_done', 'provisioning', 'os_ready']]


class Model:

    def shutdown(self):
        pass

    def create_report(self):
        pass

    def notify(self):
        pass

    def reset(self):
        pass

    def is_valid(self):
        return True

    def abort_triggered(self):
        return False


machine = CustomMachine(Model(), states=states, transitions=transitions, initial='new',
                     name="System State",
                     ignore_invalid_triggers=True,
                     auto_transitions=False)

try:
    while True:
        time.sleep(5)
except KeyboardInterrupt:  # Ctrl + C will shutdown the machine
    machine.stop_server()

from unittest import TestCase
from transitions_gui import WebMachine
import time
import threading

_SIMPLE_ARGS = dict(states=['A', 'B', 'C'], initial='A', name='Simple Machine',
                    ordered_transitions=True, ignore_invalid_triggers=True, auto_transitions=False)


class TestWebMachine(TestCase):

    def test_server(self):
        machine = WebMachine(**_SIMPLE_ARGS)
        time.sleep(1)
        machine.stop_server()

    def test_threaded_server(self):

        class MachineFactory(threading.Thread):

            def run(self):
                self.machine = WebMachine(**_SIMPLE_ARGS)

        mf = MachineFactory()
        mf.start()
        time.sleep(1)
        mf.machine.stop_server()

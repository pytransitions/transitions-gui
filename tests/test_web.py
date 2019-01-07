from unittest import TestCase
from transitions_gui import WebMachine
import time
import threading

_SIMPLE_ARGS = dict(states=['A', 'B', 'C'], initial='A', name='Simple Machine',
                    ordered_transitions=True, ignore_invalid_triggers=True, auto_transitions=False)


class TestWebMachine(TestCase):

    def tearDown(self):
        self.machine.stop_server()

    def test_server(self):
        self.machine = WebMachine(**_SIMPLE_ARGS)
        time.sleep(1)

    def test_threaded_server(self):

        class MachineFactory(threading.Thread):

            def run(self):
                self.machine = WebMachine(**_SIMPLE_ARGS)

        mf = MachineFactory()
        mf.start()
        time.sleep(1)
        self.machine = mf.machine

    def test_trigger_event(self):
        self.machine = WebMachine(**_SIMPLE_ARGS)
        time.sleep(1)
        self.assertEqual('A', self.machine.state)
        self.machine.process_message(dict(method='trigger', arg='next_state'))
        self.assertEqual('B', self.machine.state)

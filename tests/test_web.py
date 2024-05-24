import json
from unittest import TestCase
from transitions_gui import WebMachine
import time
import threading
from websocket import create_connection

_SIMPLE_ARGS = dict(states=['A', 'B', 'C'], initial='A', name='Simple Machine',
                    ordered_transitions=True, ignore_invalid_triggers=True, auto_transitions=False)

_INIT_DELAY = 0.1


class TestWebMachine(TestCase):

    def tearDown(self):
        assert self.machine._thread is not None
        self.machine.stop_server()
        time.sleep(_INIT_DELAY)

    def test_server(self):
        self.machine = WebMachine(**_SIMPLE_ARGS)  # type: ignore
        time.sleep(_INIT_DELAY)

    def test_threaded_server(self):

        class MachineFactory(threading.Thread):

            def run(self):
                self.machine = WebMachine(**_SIMPLE_ARGS)  # type: ignore

        mf = MachineFactory()
        mf.start()
        time.sleep(_INIT_DELAY)
        self.machine = mf.machine

    def test_trigger_event(self):
        self.machine = WebMachine(**_SIMPLE_ARGS)  # type: ignore
        time.sleep(_INIT_DELAY)
        self.assertEqual('A', self.machine.state)
        self.machine.process_message({"method": "trigger", "arg": "next_state"})
        self.assertEqual('B', self.machine.state)

    def test_client_connection(self):
        self.machine = WebMachine(**_SIMPLE_ARGS)  # type: ignore
        time.sleep(_INIT_DELAY)
        ws = create_connection(f"ws://localhost:{self.machine.port}/ws")
        answer = json.loads(ws.recv())
        assert answer["method"] == "update_machine"
        config = answer["arg"]
        assert config["initial"] == _SIMPLE_ARGS["initial"]
        for state in config["states"]:
            assert state["name"] in _SIMPLE_ARGS["states"]  # type: ignore
        ws.close()

    def test_client_transition(self):
        self.machine = WebMachine(**_SIMPLE_ARGS)  # type: ignore
        time.sleep(_INIT_DELAY)
        ws = create_connection(f"ws://localhost:{self.machine.port}/ws")
        _ = ws.recv()
        self.machine.next_state()
        answer = json.loads(ws.recv())
        assert answer["method"] == "state_changed"
        config = answer["arg"]
        assert config["transition"]["source"] == _SIMPLE_ARGS["initial"]
        assert config["transition"]["trigger"] == "next_state"
        assert config["state"] != _SIMPLE_ARGS["initial"]
        ws.close()

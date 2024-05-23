import logging
import time

import tornado

from transitions.extensions.markup import MarkupMachine
from transitions.extensions.nesting import HierarchicalMachine, NestedTransition
from transitions.core import Transition, Machine

_LOGGER = logging.getLogger(__name__)
_LOGGER.addHandler(logging.NullHandler())


class WebTransition(Transition):
    def _change_state(self, event_data):
        super(WebTransition, self)._change_state(event_data)
        model_name = (
            event_data.model.name
            if hasattr(event_data.model, "name")
            else str(id(event_data.model))
        )
        transition = {"source": self.source, "dest": self.dest, "trigger": event_data.event.name}
        current_state = (
            self.dest if hasattr(event_data.model.state, "name") else event_data.model.state
        )
        event_data.machine.websocket_handler.send_message(
            {
                "method": "state_changed",
                "arg": {"model": model_name, "transition": transition, "state": current_state},
            }
        )


class WebMachine(MarkupMachine):

    transition_cls = WebTransition

    def __init__(self, model=Machine.self_literal, states=None, initial='initial', transitions=None,
                 send_event=False, auto_transitions=True,
                 ordered_transitions=False, ignore_invalid_triggers=None,
                 before_state_change=None, after_state_change=None, name=None,
                 queued=False, prepare_event=None, finalize_event=None, model_attribute='state', on_exception=None,
                 on_final=None, markup=None, auto_transitions_markup=False, graph_css=None,
                 websocket_handler=None, port=8080, daemon=False, **kwargs):

        super(WebMachine, self).__init__(model=model, states=states, initial=initial, transitions=transitions,
                                         send_event=send_event, auto_transitions=auto_transitions,
                                         ordered_transitions=ordered_transitions,
                                         ignore_invalid_triggers=ignore_invalid_triggers,
                                         before_state_change=before_state_change, after_state_change=after_state_change,
                                         name=name, queued=queued, prepare_event=prepare_event,
                                         finalize_event=finalize_event, model_attribute=model_attribute,
                                         on_exception=on_exception, on_final=on_final, markup=markup,
                                         auto_transitions_markup=auto_transitions_markup, **kwargs)

        self._iloop = None
        self._http_server = None
        self._thread = None
        self.websocket_handler = websocket_handler or _init_default_handler(self, port, daemon)
        self.graph_css = graph_css or []

    def process_message(self, message):
        if message["method"] == "trigger":
            for model in self.models:
                model.trigger(message["arg"])

    def start_server(self):
        self._iloop = tornado.ioloop.IOLoop.current()
        self._http_server = self._application.listen(self._port)
        if self._iloop is not None:
            self._iloop.start()
            _LOGGER.info("Loop stopped")
            self._iloop.close()
            _LOGGER.info("Loop closed")
        else:
            raise RuntimeError("Could not initialize IOLoop for tornado.")

    def stop_server(self):
        if self._thread:
            self._iloop.add_callback(self._iloop.stop)
            self._thread.join()
            self._http_server.stop()
            self._thread = None


def _init_default_handler(machine, port=8080, daemon=False):
    import threading
    import tornado.web
    from .handlers import MainHandler, WebSocketHandler
    from .settings import settings

    handlers = [
        ("/", MainHandler, {"machine": machine}),
        ("/ws", WebSocketHandler, {"machine": machine}),
    ]
    # try to access current IOLoop. If this throws an error initialize a new event loop.
    # This is necessary when WebMachine/Tornado is not initialized in the main thread
    try:
        tornado.ioloop.IOLoop.current()
    except (RuntimeError, DeprecationWarning):
        import asyncio
        asyncio.set_event_loop(asyncio.new_event_loop())
        time.sleep(0.1)

    _LOGGER.info("Initializing tornado web application")
    machine._application = tornado.web.Application(handlers, **settings)
    machine._port = port
    server_thread = threading.Thread(target=machine.start_server)
    server_thread.daemon = daemon
    machine._thread = server_thread
    _LOGGER.info("Starting server thread with daemon=%r listening on port %d", daemon, port)
    server_thread.start()
    return WebSocketHandler


class NestedWebTransition(WebTransition, NestedTransition):
    pass


class NestedWebMachine(WebMachine, HierarchicalMachine):
    transition_cls = NestedWebTransition

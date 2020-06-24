import logging

from transitions.extensions.markup import MarkupMachine
from transitions.extensions.nesting import HierarchicalMachine, NestedTransition
from transitions.core import Transition

_LOGGER = logging.getLogger(__name__)
_LOGGER.addHandler(logging.NullHandler())


class WebTransition(Transition):

    def _change_state(self, event_data):
        super(WebTransition, self)._change_state(event_data)
        model_name = event_data.model.name if hasattr(event_data.model, 'name') else str(id(event_data.model))
        transition = {"source": self.source,
                      "dest": self.dest,
                      "trigger": event_data.event.name}
        current_state = self.dest if hasattr(event_data.model.state, 'name') else event_data.model.state
        event_data.machine.websocket_handler.send_message({"method": "state_changed",
                                                           "arg": {"model": model_name, "transition": transition,
                                                                   "state": current_state}})


class WebMachine(MarkupMachine):

    transition_cls = WebTransition

    def __init__(self, *args, **kwargs):
        self.websocket_handler = kwargs.pop('websocket_handler',
                                            _init_default_handler(self, kwargs.pop('port', 8080),
                                                                  kwargs.pop('daemon', False)))
        super(WebMachine, self).__init__(*args, **kwargs)

    def process_message(self, message):
        if message['method'] == 'trigger':
            for model in self.models:
                model.trigger(message['arg'])

    def start_server(self):
        import tornado.ioloop
        try:
            self._iloop = tornado.ioloop.IOLoop.current()
        except RuntimeError:
            import asyncio
            asyncio.set_event_loop(asyncio.new_event_loop())
            self._iloop = tornado.ioloop.IOLoop.current()
        except ImportError:
            _LOGGER.warn("Could not initialize event loop correctly.")
        self._http_server = self._application.listen(self._port)
        self._iloop.start()
        _LOGGER.info("Loop stopped")
        self._iloop.close()
        _LOGGER.info("Loop closed")

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
    handlers = [("/", MainHandler, {'machine': machine}),
                ("/ws", WebSocketHandler, {'machine': machine})]
    # try to access current IOLoop. If this throws an error initialize a new even loop.
    # This is necessary when WebMachine/Tornado is not initialized in the main thread
    try:
        tornado.ioloop.IOLoop.current()
    except RuntimeError:
        import asyncio
        asyncio.set_event_loop(asyncio.new_event_loop())
    _LOGGER.info('Initializing tornado web application')
    machine._application = tornado.web.Application(handlers, **settings)
    machine._port = port
    server_thread = threading.Thread(target=machine.start_server)
    server_thread.daemon = daemon
    machine._thread = server_thread
    _LOGGER.info('Starting server thread with daemon=%r listening on port %d', daemon, port)
    server_thread.start()
    return WebSocketHandler


class NestedWebTransition(WebTransition, NestedTransition):
    pass


class NestedWebMachine(WebMachine, HierarchicalMachine):
    transition_cls = NestedWebTransition

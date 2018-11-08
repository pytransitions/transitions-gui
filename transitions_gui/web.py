from transitions.extensions.markup import MarkupMachine
from transitions.core import Transition

class WebTransition(Transition):

    def _change_state(self, event_data):
        super(WebTransition, self)._change_state(event_data)
        model_name = event_data.model.name if hasattr(event_data.model, 'name') else str(id(event_data.model))
        transition = {"source": self.source,
                      "dest": self.dest,
                      "trigger": event_data.event.name}
        self._handler.send_message({"method": "state_changed",
                                    "arg": {"model": model_name, "transition": transition}})

    def process_message(self, message):
        if message['method'] == 'trigger':
            for model in self.machine.models:
                model.trigger(message['arg'])

class WebMachine(MarkupMachine):

    transition_cls = WebTransition

    def __init__(self, *args, **kwargs):
        self._handler = kwargs.pop('websocket_handler', None)
        if not self._handler:
            import threading
            import tornado.web
            from .handlers import MainHandler, WebSocketHandler
            from .settings import settings
            handlers = [("/", MainHandler, {'machine': self}),
                        ("/ws", WebSocketHandler, {'machine': self})]
            self._application = tornado.web.Application(handlers, **settings)
            self._port = kwargs.pop('port', 8080)
            self._thread = threading.Thread(target=self.start_server)
            self._thread.daemon = kwargs.pop('daemon', False)
            self._thread.start()
            self._hander = WebSocketHandler
        super(WebMachine, self).__init__(*args, **kwargs)

    def start_server(self):
        import tornado.ioloop
        try:
            import asyncio
            asyncio.set_event_loop(asyncio.new_event_loop())
        except ImportError:
            print("asyncio not used!")
        self._application.listen(self._port)
        self._iloop = tornado.ioloop.IOLoop.current()
        self._iloop.start()
        print("Loop stopped")
        self._iloop.close()
        print("Loop closed")

    def stop_server(self):
        if self._thread:
            self._iloop.add_callback(self._iloop.stop)
            self._thread.join()
            self._thread = None

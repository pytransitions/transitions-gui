import threading
import time
import signal

import tornado.ioloop
import tornado.web
from transitions.extensions.markup import MarkupMachine
from transitions.core import Transition

from .handlers import MainHandler, WebSocketHandler
from .settings import settings


class WebTransition(Transition):

    def _change_state(self, event_data):
        super(WebTransition, self)._change_state(event_data)
        model_name = event_data.model.name if hasattr(event_data.model, 'name') else str(id(event_data.model))
        transition = {"source": self.source,
                      "dest": self.dest,
                      "trigger": event_data.event.name}
        for ws in WebSocketHandler.sockets:
            ws.write_message({"method": "state_changed", "arg": {"model": model_name, "transition": transition}})

class WebMachine(MarkupMachine):

    transition_cls = WebTransition

    def __init__(self, *args, **kwargs):
        handlers = [("/", MainHandler),
                    ("/ws", WebSocketHandler, {'machine': self})]
        self._application = tornado.web.Application(handlers, **settings)

        self._port = kwargs.pop('port', 8080)
        self._thread = threading.Thread(target=self.start_server)
        self._thread.daemon = kwargs.pop('daemon', False)
        self._thread.start()
        super(WebMachine, self).__init__(*args, **kwargs)

    def start_server(self):
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

if __name__ == "__main__":
    states = ['A', 'B', 'C']
    transitions = [['go', 'A', 'B'], ['go', 'B', 'C'], ['go', 'C', 'A']]
    m = WebMachine(states=states, transitions=transitions, initial='A', port=8080)

    print('init done')
    try:
        while True:
            time.sleep(5)
    except KeyboardInterrupt:
        m.stop_server()



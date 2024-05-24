import tornado.websocket
import json
import logging

_LOGGER = logging.getLogger(__name__)
_LOGGER.addHandler(logging.NullHandler())


class MainHandler(tornado.web.RequestHandler):
    def initialize(self, machine):
        self.machine = machine

    def get(self):
        title = self.machine.name[:-2] if self.machine.name else "State Machine"
        self.render("index.html", title=title)


class WebSocketHandler(tornado.websocket.WebSocketHandler):
    sockets = {}

    def __init__(
            self,
            *args, **kwargs
    ):
        self.machine = None
        super(WebSocketHandler, self).__init__(*args, **kwargs)

    @classmethod
    def send_message(cls, message, port):
        if port in cls.sockets:
            cls.sockets[port].write_message(message, binary=False)

    def initialize(self, machine):
        self.machine = machine

    def open(self):
        _LOGGER.info("WebSocket opened")
        if self.machine.port in self.sockets:
            self.sockets[self.machine.port].close()
        self.sockets[self.machine.port] = self
        self.write_message(
            {
                "method": "update_machine",
                "arg": self.machine.markup,
                "style": self.machine.graph_css,
            },
            binary=False,
        )

    def on_message(self, message):
        message = json.loads(message)
        self.machine.process_message(message)

    def on_close(self):
        del self.sockets[self.machine.port]
        _LOGGER.info("WebSocket closed")

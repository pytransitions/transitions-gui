import tornado.websocket
import json
from collections import defaultdict
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
    sockets = defaultdict(set)

    def __init__(
            self,
            *args, **kwargs
    ):
        self.machine = None
        super(WebSocketHandler, self).__init__(*args, **kwargs)

    @classmethod
    def send_message(cls, message, port):
        for socket in cls.sockets[port]:
            socket.write_message(message, binary=False)

    def initialize(self, machine):
        self.machine = machine

    def open(self):
        _LOGGER.info("WebSocket opened")
        self.sockets[self.machine.port].add(self)
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
        self.sockets[self.machine.port].remove(self)
        _LOGGER.info("WebSocket closed")

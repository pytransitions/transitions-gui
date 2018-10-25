import tornado.web
import tornado.websocket
import json

class MainHandler(tornado.web.RequestHandler):
    def get(self):
        items = ["Item 1", "Item 2", "Item 3"]
        self.render("index.html", title="My title", items=items)

class WebSocketHandler(tornado.websocket.WebSocketHandler):
    sockets = set()

    def initialize(self, machine):
        self.machine = machine

    def open(self):
        print("WebSocket opened")
        self.sockets.add(self)
        self.write_message({"method": "update_machine", "arg": self.machine.markup}, binary=False)

    def on_message(self, message):
        message = json.loads(message)
        if message['method'] == 'trigger':
            self.machine.trigger(message['arg'])

    def on_close(self):
        self.sockets.remove(self)
        print("WebSocket closed")

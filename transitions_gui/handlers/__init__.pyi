from typing import Optional, ClassVar, Awaitable, Union, Dict, Any, Set

import tornado.websocket
from transitions_gui import WebMachine

class MainHandler(tornado.web.RequestHandler):
    machine: WebMachine
    def initialize(self, machine: WebMachine) -> None: ...
    def get(self) -> None: ...

class WebSocketHandler(tornado.websocket.WebSocketHandler):
    sockets: ClassVar[Dict[int, "WebSocketHandler"]]
    machine: Optional[WebMachine]

    def send_message(self, message: Dict[str, Any], port: int) -> None: ...
    def initialize(self, machine: WebMachine) -> None: ...
    def open(self, *args: str, **kwargs: str) -> Optional[Awaitable[None]]: ...
    def on_message(self, message: Union[str, bytes]) -> None: ...
    def on_close(self) -> None: ...

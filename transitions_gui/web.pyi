from typing import List, Dict, Union, Optional, Type, Sequence, Any, ClassVar
from enum import Enum
from threading import Thread

from tornado.httpserver import HTTPServer
from tornado.ioloop import IOLoop
from tornado.web import Application
from transitions.core import Transition, ModelParameter, StateConfig, StateIdentifier, TransitionConfig, CallbacksArg
from transitions.extensions.markup import MarkupMachine, MarkupConfig
from transitions.extensions.nesting import HierarchicalMachine, NestedTransition, NestedStateIdentifier, NestedStateConfig

from transitions_gui.handlers import WebSocketHandler

class WebTransition(Transition): ...

class WebMachine(MarkupMachine):
    transition_cls: Type[WebTransition]
    websocket_handler: Type[WebSocketHandler]
    graph_css: List[Dict[str, Union[int, float, str]]]
    _application: Optional[Application]
    _http_server: Optional[HTTPServer]
    _iloop: Optional[IOLoop]
    _thread: Optional[Thread]

    def __init__(self, model: Optional[ModelParameter]=...,
                 states: Optional[Union[Sequence[StateConfig], Type[Enum]]] = ...,
                 initial: Optional[StateIdentifier] = ...,
                 transitions: Optional[Union[TransitionConfig, Sequence[TransitionConfig]]] = ...,
                 send_event: bool = ..., auto_transitions: bool = ..., ordered_transitions: bool = ...,
                 ignore_invalid_triggers: Optional[bool] = ...,
                 before_state_change: CallbacksArg = ..., after_state_change: CallbacksArg = ...,
                 name: str = ..., queued: bool = ...,
                 prepare_event: CallbacksArg = ..., finalize_event: CallbacksArg = ...,
                 model_attribute: str = ..., on_exception: CallbacksArg = ...,
                 on_final: CallbacksArg = ..., markup: Optional[MarkupConfig] = ...,
                 auto_transitions_markup: bool = ...,
                 graph_css: Optional[List[Dict[str, Union[int, float, str]]]] = ...,
                 websocket_handler: Optional[Type[WebSocketHandler]] = ..., port:int = ..., daemon: bool = ...,
                 **kwargs: Dict[str, Any]) -> None: ...
    def process_message(self, message) -> None: ...
    def start_server(self) -> None: ...
    def stop_server(self) -> None: ...

class NestedWebTransition(WebTransition, NestedTransition): ...

class NestedWebMachine(WebMachine, HierarchicalMachine):
    transition_cls = Type[NestedWebTransition]

    def add_states(self, states: Union[List[NestedStateConfig], NestedStateConfig],  # type: ignore[override]
                   on_enter: CallbacksArg = ...,  on_exit: CallbacksArg = ...,
                   ignore_invalid_triggers: Optional[bool] = ..., **kwargs: Dict[str, Any]) -> None: ...

    def add_transition(self, trigger: str,  # type: ignore[override]
                       source: Union[NestedStateIdentifier, List[NestedStateIdentifier]],
                       dest: Optional[NestedStateIdentifier] = ...,
                       conditions: CallbacksArg = ...,
                       unless: CallbacksArg = ..., before: CallbacksArg = ..., after: CallbacksArg = ...,
                       prepare: CallbacksArg = ..., **kwargs: Dict[str, Any]) -> None: ...


def _init_default_handler(machine: WebMachine, port: int = ..., daemon: bool = ...) -> Type[WebSocketHandler]: ...
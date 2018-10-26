# transitions-gui - A frontend for [transitions](https://github.com/pytransitions/transitions) state machines 

An extension for the [transitions](https://github.com/pytransitions/transitions) state machine package.

## Preparation

This project is still in a very early stage and requires yet unreleased transitions features.
This is why we need to install it from the source code repo.

```bash
# install transitions 0.7.0
pip install git+https://github.com/pytransitions/transitions@next-release
git clone install https://github.com/aleneum/transitions-gui.git
cd transitions-gui
```

## Quickstart

Let's begin by creating a simple circular state machine.
Running `python examples/simple.py` will execute the following code:

```python
from transitions_gui import WebMachine
import time

states = ['A', 'B', 'C', 'D', 'E', 'F']
# initializing the machine will also start the server (default port is 8080)
machine = WebMachine(states=states, initial='A',
                     ordered_transitions=True,
                     ignore_invalid_triggers=True,
                     auto_transitions=False)

try:
    while True:
        time.sleep(5)
except KeyboardInterrupt:  # Ctrl + C will shutdown the machine
    machine.stop_server()
```

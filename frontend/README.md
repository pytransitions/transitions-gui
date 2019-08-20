# Frontend development for transitions-gui

## Prerequisites 

You need to have a recent version [Node.js with npm](https://nodejs.org/en/download/) installed.
`npm` will be used to retrieve all further dependencies mentioned in `package.json`

```bash
cd <source>/frontend  # folder with package.json
npm install  # all set!
```

## Build flow

All Javascript code is located in [src](./src).
Tornado does not serve code from that location but from `<source>/transitions_gui/static/js`.
Before changes can be observed, webpack has to be used to compile all individual files and dependencies into one large `main.js`.
To do so, execute *ONE* of the following statements:

```bash
npm run dev  # produces a (rather large) development version for debugging
npm run prod # produces a minified production version
npm run serve # produces a development version and runs the `<source>/examples/simple.py` for testing 
```

## Pull request policy

Please do not file a pull request including a `main.js`.
The compiled file is rather large and almost impossible to review.
Revert changes to `main.js` and `main.js.map` beforehand.

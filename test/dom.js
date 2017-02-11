const jsdom = require('jsdom')

const dom = jsdom.jsdom('<!doctype html><html><head></head><body></body></html>')

global.document = dom
global.window = dom.defaultView

propagateToGlobal(global.window)

function propagateToGlobal (window) {
  for (let key in window) {
    if (!window.hasOwnProperty(key)) { continue }
    if (key in global) { continue }

    global[key] = window[key]
  }
}

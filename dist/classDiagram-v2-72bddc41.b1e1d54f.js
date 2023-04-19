// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"node_modules/mermaid/dist/classDiagram-v2-72bddc41.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.diagram = void 0;
var _styles16907e1b = require("./styles-16907e1b.js");
var _d = require("d3");
var graphlib = _interopRequireWildcard(require("dagre-d3-es/src/graphlib/index.js"));
var _commonDb573409be = require("./commonDb-573409be.js");
var _index5219d = require("./index-5219d011.js");
var _utilsD622194a = require("./utils-d622194a.js");
require("./mermaidAPI-3ae0f2f0.js");
require("stylis");
require("dompurify");
require("lodash-es/isEmpty.js");
require("dayjs");
require("khroma");
require("dagre-d3-es/src/dagre/index.js");
require("dagre-d3-es/src/graphlib/json.js");
require("./edges-2e77835f.js");
require("./createText-1f5f8f92.js");
require("@khanacademy/simple-markdown");
require("./svgDraw-2526cba0.js");
require("@braintree/sanitize-url");
require("lodash-es/memoize.js");
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
const sanitizeText = txt => _commonDb573409be.e.sanitizeText(txt, (0, _commonDb573409be.g)());
let conf = {
  dividerMargin: 10,
  padding: 5,
  textHeight: 10,
  curve: void 0
};
const addClasses = function (classes, g, _id, diagObj) {
  const keys = Object.keys(classes);
  _commonDb573409be.l.info("keys:", keys);
  _commonDb573409be.l.info(classes);
  keys.forEach(function (id) {
    var _a, _b;
    const vertex = classes[id];
    let cssClassStr = "";
    if (vertex.cssClasses.length > 0) {
      cssClassStr = cssClassStr + " " + vertex.cssClasses.join(" ");
    }
    const styles2 = {
      labelStyle: "",
      style: ""
    };
    const vertexText = vertex.label ?? vertex.id;
    const radius = 0;
    const shape = "class_box";
    const node = {
      labelStyle: styles2.labelStyle,
      shape,
      labelText: sanitizeText(vertexText),
      classData: vertex,
      rx: radius,
      ry: radius,
      class: cssClassStr,
      style: styles2.style,
      id: vertex.id,
      domId: vertex.domId,
      tooltip: diagObj.db.getTooltip(vertex.id) || "",
      haveCallback: vertex.haveCallback,
      link: vertex.link,
      width: vertex.type === "group" ? 500 : void 0,
      type: vertex.type,
      // TODO V10: Flowchart ? Keeping flowchart for backwards compatibility. Remove in next major release
      padding: ((_a = (0, _commonDb573409be.g)().flowchart) == null ? void 0 : _a.padding) ?? ((_b = (0, _commonDb573409be.g)().class) == null ? void 0 : _b.padding)
    };
    g.setNode(vertex.id, node);
    _commonDb573409be.l.info("setNode", node);
  });
};
const addNotes = function (notes, g, startEdgeId, classes) {
  _commonDb573409be.l.info(notes);
  notes.forEach(function (note, i) {
    var _a, _b;
    const vertex = note;
    const cssNoteStr = "";
    const styles2 = {
      labelStyle: "",
      style: ""
    };
    const vertexText = vertex.text;
    const radius = 0;
    const shape = "note";
    const node = {
      labelStyle: styles2.labelStyle,
      shape,
      labelText: sanitizeText(vertexText),
      noteData: vertex,
      rx: radius,
      ry: radius,
      class: cssNoteStr,
      style: styles2.style,
      id: vertex.id,
      domId: vertex.id,
      tooltip: "",
      type: "note",
      // TODO V10: Flowchart ? Keeping flowchart for backwards compatibility. Remove in next major release
      padding: ((_a = (0, _commonDb573409be.g)().flowchart) == null ? void 0 : _a.padding) ?? ((_b = (0, _commonDb573409be.g)().class) == null ? void 0 : _b.padding)
    };
    g.setNode(vertex.id, node);
    _commonDb573409be.l.info("setNode", node);
    if (!vertex.class || !(vertex.class in classes)) {
      return;
    }
    const edgeId = startEdgeId + i;
    const edgeData = {
      id: `edgeNote${edgeId}`,
      //Set relationship style and line type
      classes: "relation",
      pattern: "dotted",
      // Set link type for rendering
      arrowhead: "none",
      //Set edge extra labels
      startLabelRight: "",
      endLabelLeft: "",
      //Set relation arrow types
      arrowTypeStart: "none",
      arrowTypeEnd: "none",
      style: "fill:none",
      labelStyle: "",
      curve: (0, _utilsD622194a.o)(conf.curve, _d.curveLinear)
    };
    g.setEdge(vertex.id, vertex.class, edgeData, edgeId);
  });
};
const addRelations = function (relations, g) {
  const conf2 = (0, _commonDb573409be.g)().flowchart;
  let cnt = 0;
  relations.forEach(function (edge) {
    var _a;
    cnt++;
    const edgeData = {
      //Set relationship style and line type
      classes: "relation",
      pattern: edge.relation.lineType == 1 ? "dashed" : "solid",
      id: "id" + cnt,
      // Set link type for rendering
      arrowhead: edge.type === "arrow_open" ? "none" : "normal",
      //Set edge extra labels
      startLabelRight: edge.relationTitle1 === "none" ? "" : edge.relationTitle1,
      endLabelLeft: edge.relationTitle2 === "none" ? "" : edge.relationTitle2,
      //Set relation arrow types
      arrowTypeStart: getArrowMarker(edge.relation.type1),
      arrowTypeEnd: getArrowMarker(edge.relation.type2),
      style: "fill:none",
      labelStyle: "",
      curve: (0, _utilsD622194a.o)(conf2 == null ? void 0 : conf2.curve, _d.curveLinear)
    };
    _commonDb573409be.l.info(edgeData, edge);
    if (edge.style !== void 0) {
      const styles2 = (0, _utilsD622194a.n)(edge.style);
      edgeData.style = styles2.style;
      edgeData.labelStyle = styles2.labelStyle;
    }
    edge.text = edge.title;
    if (edge.text === void 0) {
      if (edge.style !== void 0) {
        edgeData.arrowheadStyle = "fill: #333";
      }
    } else {
      edgeData.arrowheadStyle = "fill: #333";
      edgeData.labelpos = "c";
      if (((_a = (0, _commonDb573409be.g)().flowchart) == null ? void 0 : _a.htmlLabels) ?? (0, _commonDb573409be.g)().htmlLabels) {
        edgeData.labelType = "html";
        edgeData.label = '<span class="edgeLabel">' + edge.text + "</span>";
      } else {
        edgeData.labelType = "text";
        edgeData.label = edge.text.replace(_commonDb573409be.e.lineBreakRegex, "\n");
        if (edge.style === void 0) {
          edgeData.style = edgeData.style || "stroke: #333; stroke-width: 1.5px;fill:none";
        }
        edgeData.labelStyle = edgeData.labelStyle.replace("color:", "fill:");
      }
    }
    g.setEdge(edge.id1, edge.id2, edgeData, cnt);
  });
};
const setConf = function (cnf) {
  conf = {
    ...conf,
    ...cnf
  };
};
const draw = function (text, id, _version, diagObj) {
  _commonDb573409be.l.info("Drawing class - ", id);
  const conf2 = (0, _commonDb573409be.g)().flowchart ?? (0, _commonDb573409be.g)().class;
  const securityLevel = (0, _commonDb573409be.g)().securityLevel;
  _commonDb573409be.l.info("config:", conf2);
  const nodeSpacing = (conf2 == null ? void 0 : conf2.nodeSpacing) ?? 50;
  const rankSpacing = (conf2 == null ? void 0 : conf2.rankSpacing) ?? 50;
  const g = new graphlib.Graph({
    multigraph: true,
    compound: true
  }).setGraph({
    rankdir: diagObj.db.getDirection(),
    nodesep: nodeSpacing,
    ranksep: rankSpacing,
    marginx: 8,
    marginy: 8
  }).setDefaultEdgeLabel(function () {
    return {};
  });
  const classes = diagObj.db.getClasses();
  const relations = diagObj.db.getRelations();
  const notes = diagObj.db.getNotes();
  _commonDb573409be.l.info(relations);
  addClasses(classes, g, id, diagObj);
  addRelations(relations, g);
  addNotes(notes, g, relations.length + 1, classes);
  let sandboxElement;
  if (securityLevel === "sandbox") {
    sandboxElement = (0, _d.select)("#i" + id);
  }
  const root = securityLevel === "sandbox" ?
  // @ts-ignore Ignore type error for now
  (0, _d.select)(sandboxElement.nodes()[0].contentDocument.body) : (0, _d.select)("body");
  const svg = root.select(`[id="${id}"]`);
  const element = root.select("#" + id + " g");
  (0, _index5219d.r)(element, g, ["aggregation", "extension", "composition", "dependency", "lollipop"], "classDiagram", id);
  _utilsD622194a.u.insertTitle(svg, "classTitleText", (conf2 == null ? void 0 : conf2.titleTopMargin) ?? 5, diagObj.db.getDiagramTitle());
  (0, _utilsD622194a.s)(g, svg, conf2 == null ? void 0 : conf2.diagramPadding, conf2 == null ? void 0 : conf2.useMaxWidth);
  if (!(conf2 == null ? void 0 : conf2.htmlLabels)) {
    const doc = securityLevel === "sandbox" ? sandboxElement.nodes()[0].contentDocument : document;
    const labels = doc.querySelectorAll('[id="' + id + '"] .edgeLabel .label');
    for (const label of labels) {
      const dim = label.getBBox();
      const rect = doc.createElementNS("http://www.w3.org/2000/svg", "rect");
      rect.setAttribute("rx", 0);
      rect.setAttribute("ry", 0);
      rect.setAttribute("width", dim.width);
      rect.setAttribute("height", dim.height);
      label.insertBefore(rect, label.firstChild);
    }
  }
};
function getArrowMarker(type) {
  let marker;
  switch (type) {
    case 0:
      marker = "aggregation";
      break;
    case 1:
      marker = "extension";
      break;
    case 2:
      marker = "composition";
      break;
    case 3:
      marker = "dependency";
      break;
    case 4:
      marker = "lollipop";
      break;
    default:
      marker = "none";
  }
  return marker;
}
const renderer = {
  setConf,
  draw
};
const diagram = {
  parser: _styles16907e1b.p,
  db: _styles16907e1b.d,
  renderer,
  styles: _styles16907e1b.s,
  init: cnf => {
    if (!cnf.class) {
      cnf.class = {};
    }
    cnf.class.arrowMarkerAbsolute = cnf.arrowMarkerAbsolute;
    _styles16907e1b.d.clear();
  }
};
exports.diagram = diagram;
},{"./styles-16907e1b.js":"node_modules/mermaid/dist/styles-16907e1b.js","d3":"node_modules/d3/src/index.js","dagre-d3-es/src/graphlib/index.js":"node_modules/dagre-d3-es/src/graphlib/index.js","./commonDb-573409be.js":"node_modules/mermaid/dist/commonDb-573409be.js","./index-5219d011.js":"node_modules/mermaid/dist/index-5219d011.js","./utils-d622194a.js":"node_modules/mermaid/dist/utils-d622194a.js","./mermaidAPI-3ae0f2f0.js":"node_modules/mermaid/dist/mermaidAPI-3ae0f2f0.js","stylis":"node_modules/stylis/dist/stylis.mjs","dompurify":"node_modules/dompurify/dist/purify.js","lodash-es/isEmpty.js":"node_modules/lodash-es/isEmpty.js","dayjs":"node_modules/dayjs/dayjs.min.js","khroma":"node_modules/khroma/dist/index.js","dagre-d3-es/src/dagre/index.js":"node_modules/dagre-d3-es/src/dagre/index.js","dagre-d3-es/src/graphlib/json.js":"node_modules/dagre-d3-es/src/graphlib/json.js","./edges-2e77835f.js":"node_modules/mermaid/dist/edges-2e77835f.js","./createText-1f5f8f92.js":"node_modules/mermaid/dist/createText-1f5f8f92.js","@khanacademy/simple-markdown":"node_modules/@khanacademy/simple-markdown/dist/es/index.js","./svgDraw-2526cba0.js":"node_modules/mermaid/dist/svgDraw-2526cba0.js","@braintree/sanitize-url":"node_modules/@braintree/sanitize-url/dist/index.js","lodash-es/memoize.js":"node_modules/lodash-es/memoize.js"}],"node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;
function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}
module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;
if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "55630" + '/');
  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);
    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);
          if (didAccept) {
            handled = true;
          }
        }
      });

      // Enable HMR for CSS by default.
      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });
      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else if (location.reload) {
        // `location` global exists in a web worker context but lacks `.reload()` function.
        location.reload();
      }
    }
    if (data.type === 'reload') {
      ws.close();
      ws.onclose = function () {
        location.reload();
      };
    }
    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }
    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}
function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);
  if (overlay) {
    overlay.remove();
  }
}
function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID;

  // html encode message and stack trace
  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}
function getParents(bundle, id) {
  var modules = bundle.modules;
  if (!modules) {
    return [];
  }
  var parents = [];
  var k, d, dep;
  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];
      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }
  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }
  return parents;
}
function hmrApply(bundle, asset) {
  var modules = bundle.modules;
  if (!modules) {
    return;
  }
  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}
function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;
  if (!modules) {
    return;
  }
  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }
  if (checkedAssets[id]) {
    return;
  }
  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);
  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }
  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}
function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};
  if (cached) {
    cached.hot.data = bundle.hotData;
  }
  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }
  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];
  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });
    return true;
  }
}
},{}]},{},["node_modules/parcel-bundler/src/builtins/hmr-runtime.js"], null)
//# sourceMappingURL=/classDiagram-v2-72bddc41.b1e1d54f.js.map
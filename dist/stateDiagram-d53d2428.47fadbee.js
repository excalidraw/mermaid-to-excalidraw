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
})({"node_modules/mermaid/dist/stateDiagram-d53d2428.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.diagram = void 0;
var _styles47a825a = require("./styles-47a825a5.js");
var _d = require("d3");
var _index = require("dagre-d3-es/src/dagre/index.js");
var graphlib = _interopRequireWildcard(require("dagre-d3-es/src/graphlib/index.js"));
var _commonDb573409be = require("./commonDb-573409be.js");
var _utilsD622194a = require("./utils-d622194a.js");
require("./mermaidAPI-3ae0f2f0.js");
require("stylis");
require("dompurify");
require("lodash-es/isEmpty.js");
require("dayjs");
require("khroma");
require("@braintree/sanitize-url");
require("lodash-es/memoize.js");
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
const idCache = {};
const set = (key, val) => {
  idCache[key] = val;
};
const get = k => idCache[k];
const keys = () => Object.keys(idCache);
const size = () => keys().length;
const idCache$1 = {
  get,
  set,
  keys,
  size
};
const drawStartState = g => g.append("circle").attr("class", "start-state").attr("r", (0, _commonDb573409be.g)().state.sizeUnit).attr("cx", (0, _commonDb573409be.g)().state.padding + (0, _commonDb573409be.g)().state.sizeUnit).attr("cy", (0, _commonDb573409be.g)().state.padding + (0, _commonDb573409be.g)().state.sizeUnit);
const drawDivider = g => g.append("line").style("stroke", "grey").style("stroke-dasharray", "3").attr("x1", (0, _commonDb573409be.g)().state.textHeight).attr("class", "divider").attr("x2", (0, _commonDb573409be.g)().state.textHeight * 2).attr("y1", 0).attr("y2", 0);
const drawSimpleState = (g, stateDef) => {
  const state = g.append("text").attr("x", 2 * (0, _commonDb573409be.g)().state.padding).attr("y", (0, _commonDb573409be.g)().state.textHeight + 2 * (0, _commonDb573409be.g)().state.padding).attr("font-size", (0, _commonDb573409be.g)().state.fontSize).attr("class", "state-title").text(stateDef.id);
  const classBox = state.node().getBBox();
  g.insert("rect", ":first-child").attr("x", (0, _commonDb573409be.g)().state.padding).attr("y", (0, _commonDb573409be.g)().state.padding).attr("width", classBox.width + 2 * (0, _commonDb573409be.g)().state.padding).attr("height", classBox.height + 2 * (0, _commonDb573409be.g)().state.padding).attr("rx", (0, _commonDb573409be.g)().state.radius);
  return state;
};
const drawDescrState = (g, stateDef) => {
  const addTspan = function (textEl, txt, isFirst2) {
    const tSpan = textEl.append("tspan").attr("x", 2 * (0, _commonDb573409be.g)().state.padding).text(txt);
    if (!isFirst2) {
      tSpan.attr("dy", (0, _commonDb573409be.g)().state.textHeight);
    }
  };
  const title = g.append("text").attr("x", 2 * (0, _commonDb573409be.g)().state.padding).attr("y", (0, _commonDb573409be.g)().state.textHeight + 1.3 * (0, _commonDb573409be.g)().state.padding).attr("font-size", (0, _commonDb573409be.g)().state.fontSize).attr("class", "state-title").text(stateDef.descriptions[0]);
  const titleBox = title.node().getBBox();
  const titleHeight = titleBox.height;
  const description = g.append("text").attr("x", (0, _commonDb573409be.g)().state.padding).attr("y", titleHeight + (0, _commonDb573409be.g)().state.padding * 0.4 + (0, _commonDb573409be.g)().state.dividerMargin + (0, _commonDb573409be.g)().state.textHeight).attr("class", "state-description");
  let isFirst = true;
  let isSecond = true;
  stateDef.descriptions.forEach(function (descr) {
    if (!isFirst) {
      addTspan(description, descr, isSecond);
      isSecond = false;
    }
    isFirst = false;
  });
  const descrLine = g.append("line").attr("x1", (0, _commonDb573409be.g)().state.padding).attr("y1", (0, _commonDb573409be.g)().state.padding + titleHeight + (0, _commonDb573409be.g)().state.dividerMargin / 2).attr("y2", (0, _commonDb573409be.g)().state.padding + titleHeight + (0, _commonDb573409be.g)().state.dividerMargin / 2).attr("class", "descr-divider");
  const descrBox = description.node().getBBox();
  const width = Math.max(descrBox.width, titleBox.width);
  descrLine.attr("x2", width + 3 * (0, _commonDb573409be.g)().state.padding);
  g.insert("rect", ":first-child").attr("x", (0, _commonDb573409be.g)().state.padding).attr("y", (0, _commonDb573409be.g)().state.padding).attr("width", width + 2 * (0, _commonDb573409be.g)().state.padding).attr("height", descrBox.height + titleHeight + 2 * (0, _commonDb573409be.g)().state.padding).attr("rx", (0, _commonDb573409be.g)().state.radius);
  return g;
};
const addTitleAndBox = (g, stateDef, altBkg) => {
  const pad = (0, _commonDb573409be.g)().state.padding;
  const dblPad = 2 * (0, _commonDb573409be.g)().state.padding;
  const orgBox = g.node().getBBox();
  const orgWidth = orgBox.width;
  const orgX = orgBox.x;
  const title = g.append("text").attr("x", 0).attr("y", (0, _commonDb573409be.g)().state.titleShift).attr("font-size", (0, _commonDb573409be.g)().state.fontSize).attr("class", "state-title").text(stateDef.id);
  const titleBox = title.node().getBBox();
  const titleWidth = titleBox.width + dblPad;
  let width = Math.max(titleWidth, orgWidth);
  if (width === orgWidth) {
    width = width + dblPad;
  }
  let startX;
  const graphBox = g.node().getBBox();
  if (stateDef.doc) ;
  startX = orgX - pad;
  if (titleWidth > orgWidth) {
    startX = (orgWidth - width) / 2 + pad;
  }
  if (Math.abs(orgX - graphBox.x) < pad && titleWidth > orgWidth) {
    startX = orgX - (titleWidth - orgWidth) / 2;
  }
  const lineY = 1 - (0, _commonDb573409be.g)().state.textHeight;
  g.insert("rect", ":first-child").attr("x", startX).attr("y", lineY).attr("class", altBkg ? "alt-composit" : "composit").attr("width", width).attr("height", graphBox.height + (0, _commonDb573409be.g)().state.textHeight + (0, _commonDb573409be.g)().state.titleShift + 1).attr("rx", "0");
  title.attr("x", startX + pad);
  if (titleWidth <= orgWidth) {
    title.attr("x", orgX + (width - dblPad) / 2 - titleWidth / 2 + pad);
  }
  g.insert("rect", ":first-child").attr("x", startX).attr("y", (0, _commonDb573409be.g)().state.titleShift - (0, _commonDb573409be.g)().state.textHeight - (0, _commonDb573409be.g)().state.padding).attr("width", width).attr("height", (0, _commonDb573409be.g)().state.textHeight * 3).attr("rx", (0, _commonDb573409be.g)().state.radius);
  g.insert("rect", ":first-child").attr("x", startX).attr("y", (0, _commonDb573409be.g)().state.titleShift - (0, _commonDb573409be.g)().state.textHeight - (0, _commonDb573409be.g)().state.padding).attr("width", width).attr("height", graphBox.height + 3 + 2 * (0, _commonDb573409be.g)().state.textHeight).attr("rx", (0, _commonDb573409be.g)().state.radius);
  return g;
};
const drawEndState = g => {
  g.append("circle").attr("class", "end-state-outer").attr("r", (0, _commonDb573409be.g)().state.sizeUnit + (0, _commonDb573409be.g)().state.miniPadding).attr("cx", (0, _commonDb573409be.g)().state.padding + (0, _commonDb573409be.g)().state.sizeUnit + (0, _commonDb573409be.g)().state.miniPadding).attr("cy", (0, _commonDb573409be.g)().state.padding + (0, _commonDb573409be.g)().state.sizeUnit + (0, _commonDb573409be.g)().state.miniPadding);
  return g.append("circle").attr("class", "end-state-inner").attr("r", (0, _commonDb573409be.g)().state.sizeUnit).attr("cx", (0, _commonDb573409be.g)().state.padding + (0, _commonDb573409be.g)().state.sizeUnit + 2).attr("cy", (0, _commonDb573409be.g)().state.padding + (0, _commonDb573409be.g)().state.sizeUnit + 2);
};
const drawForkJoinState = (g, stateDef) => {
  let width = (0, _commonDb573409be.g)().state.forkWidth;
  let height = (0, _commonDb573409be.g)().state.forkHeight;
  if (stateDef.parentId) {
    let tmp = width;
    width = height;
    height = tmp;
  }
  return g.append("rect").style("stroke", "black").style("fill", "black").attr("width", width).attr("height", height).attr("x", (0, _commonDb573409be.g)().state.padding).attr("y", (0, _commonDb573409be.g)().state.padding);
};
const _drawLongText = (_text, x, y, g) => {
  let textHeight = 0;
  const textElem = g.append("text");
  textElem.style("text-anchor", "start");
  textElem.attr("class", "noteText");
  let text = _text.replace(/\r\n/g, "<br/>");
  text = text.replace(/\n/g, "<br/>");
  const lines = text.split(_commonDb573409be.e.lineBreakRegex);
  let tHeight = 1.25 * (0, _commonDb573409be.g)().state.noteMargin;
  for (const line2 of lines) {
    const txt = line2.trim();
    if (txt.length > 0) {
      const span = textElem.append("tspan");
      span.text(txt);
      if (tHeight === 0) {
        const textBounds = span.node().getBBox();
        tHeight += textBounds.height;
      }
      textHeight += tHeight;
      span.attr("x", x + (0, _commonDb573409be.g)().state.noteMargin);
      span.attr("y", y + textHeight + 1.25 * (0, _commonDb573409be.g)().state.noteMargin);
    }
  }
  return {
    textWidth: textElem.node().getBBox().width,
    textHeight
  };
};
const drawNote = (text, g) => {
  g.attr("class", "state-note");
  const note = g.append("rect").attr("x", 0).attr("y", (0, _commonDb573409be.g)().state.padding);
  const rectElem = g.append("g");
  const {
    textWidth,
    textHeight
  } = _drawLongText(text, 0, 0, rectElem);
  note.attr("height", textHeight + 2 * (0, _commonDb573409be.g)().state.noteMargin);
  note.attr("width", textWidth + (0, _commonDb573409be.g)().state.noteMargin * 2);
  return note;
};
const drawState = function (elem, stateDef) {
  const id = stateDef.id;
  const stateInfo = {
    id,
    label: stateDef.id,
    width: 0,
    height: 0
  };
  const g = elem.append("g").attr("id", id).attr("class", "stateGroup");
  if (stateDef.type === "start") {
    drawStartState(g);
  }
  if (stateDef.type === "end") {
    drawEndState(g);
  }
  if (stateDef.type === "fork" || stateDef.type === "join") {
    drawForkJoinState(g, stateDef);
  }
  if (stateDef.type === "note") {
    drawNote(stateDef.note.text, g);
  }
  if (stateDef.type === "divider") {
    drawDivider(g);
  }
  if (stateDef.type === "default" && stateDef.descriptions.length === 0) {
    drawSimpleState(g, stateDef);
  }
  if (stateDef.type === "default" && stateDef.descriptions.length > 0) {
    drawDescrState(g, stateDef);
  }
  const stateBox = g.node().getBBox();
  stateInfo.width = stateBox.width + 2 * (0, _commonDb573409be.g)().state.padding;
  stateInfo.height = stateBox.height + 2 * (0, _commonDb573409be.g)().state.padding;
  idCache$1.set(id, stateInfo);
  return stateInfo;
};
let edgeCount = 0;
const drawEdge = function (elem, path, relation) {
  const getRelationType = function (type) {
    switch (type) {
      case _styles47a825a.d.relationType.AGGREGATION:
        return "aggregation";
      case _styles47a825a.d.relationType.EXTENSION:
        return "extension";
      case _styles47a825a.d.relationType.COMPOSITION:
        return "composition";
      case _styles47a825a.d.relationType.DEPENDENCY:
        return "dependency";
    }
  };
  path.points = path.points.filter(p => !Number.isNaN(p.y));
  const lineData = path.points;
  const lineFunction = (0, _d.line)().x(function (d) {
    return d.x;
  }).y(function (d) {
    return d.y;
  }).curve(_d.curveBasis);
  const svgPath = elem.append("path").attr("d", lineFunction(lineData)).attr("id", "edge" + edgeCount).attr("class", "transition");
  let url = "";
  if ((0, _commonDb573409be.g)().state.arrowMarkerAbsolute) {
    url = window.location.protocol + "//" + window.location.host + window.location.pathname + window.location.search;
    url = url.replace(/\(/g, "\\(");
    url = url.replace(/\)/g, "\\)");
  }
  svgPath.attr("marker-end", "url(" + url + "#" + getRelationType(_styles47a825a.d.relationType.DEPENDENCY) + "End)");
  if (relation.title !== void 0) {
    const label = elem.append("g").attr("class", "stateLabel");
    const {
      x,
      y
    } = _utilsD622194a.u.calcLabelPosition(path.points);
    const rows = _commonDb573409be.e.getRows(relation.title);
    let titleHeight = 0;
    const titleRows = [];
    let maxWidth = 0;
    let minX = 0;
    for (let i = 0; i <= rows.length; i++) {
      const title = label.append("text").attr("text-anchor", "middle").text(rows[i]).attr("x", x).attr("y", y + titleHeight);
      const boundstmp = title.node().getBBox();
      maxWidth = Math.max(maxWidth, boundstmp.width);
      minX = Math.min(minX, boundstmp.x);
      _commonDb573409be.l.info(boundstmp.x, x, y + titleHeight);
      if (titleHeight === 0) {
        const titleBox = title.node().getBBox();
        titleHeight = titleBox.height;
        _commonDb573409be.l.info("Title height", titleHeight, y);
      }
      titleRows.push(title);
    }
    let boxHeight = titleHeight * rows.length;
    if (rows.length > 1) {
      const heightAdj = (rows.length - 1) * titleHeight * 0.5;
      titleRows.forEach((title, i) => title.attr("y", y + i * titleHeight - heightAdj));
      boxHeight = titleHeight * rows.length;
    }
    const bounds = label.node().getBBox();
    label.insert("rect", ":first-child").attr("class", "box").attr("x", x - maxWidth / 2 - (0, _commonDb573409be.g)().state.padding / 2).attr("y", y - boxHeight / 2 - (0, _commonDb573409be.g)().state.padding / 2 - 3.5).attr("width", maxWidth + (0, _commonDb573409be.g)().state.padding).attr("height", boxHeight + (0, _commonDb573409be.g)().state.padding);
    _commonDb573409be.l.info(bounds);
  }
  edgeCount++;
};
let conf;
const transformationLog = {};
const setConf = function () {};
const insertMarkers = function (elem) {
  elem.append("defs").append("marker").attr("id", "dependencyEnd").attr("refX", 19).attr("refY", 7).attr("markerWidth", 20).attr("markerHeight", 28).attr("orient", "auto").append("path").attr("d", "M 19,7 L9,13 L14,7 L9,1 Z");
};
const draw = function (text, id, _version, diagObj) {
  conf = (0, _commonDb573409be.g)().state;
  const securityLevel = (0, _commonDb573409be.g)().securityLevel;
  let sandboxElement;
  if (securityLevel === "sandbox") {
    sandboxElement = (0, _d.select)("#i" + id);
  }
  const root = securityLevel === "sandbox" ? (0, _d.select)(sandboxElement.nodes()[0].contentDocument.body) : (0, _d.select)("body");
  const doc = securityLevel === "sandbox" ? sandboxElement.nodes()[0].contentDocument : document;
  _commonDb573409be.l.debug("Rendering diagram " + text);
  const diagram2 = root.select(`[id='${id}']`);
  insertMarkers(diagram2);
  const graph = new graphlib.Graph({
    multigraph: true,
    compound: true,
    // acyclicer: 'greedy',
    rankdir: "RL"
    // ranksep: '20'
  });

  graph.setDefaultEdgeLabel(function () {
    return {};
  });
  const rootDoc = diagObj.db.getRootDoc();
  renderDoc(rootDoc, diagram2, void 0, false, root, doc, diagObj);
  const padding = conf.padding;
  const bounds = diagram2.node().getBBox();
  const width = bounds.width + padding * 2;
  const height = bounds.height + padding * 2;
  const svgWidth = width * 1.75;
  (0, _utilsD622194a.k)(diagram2, height, svgWidth, conf.useMaxWidth);
  diagram2.attr("viewBox", `${bounds.x - conf.padding}  ${bounds.y - conf.padding} ` + width + " " + height);
};
const getLabelWidth = text => {
  return text ? text.length * conf.fontSizeFactor : 1;
};
const renderDoc = (doc, diagram2, parentId, altBkg, root, domDocument, diagObj) => {
  const graph = new graphlib.Graph({
    compound: true,
    multigraph: true
  });
  let i;
  let edgeFreeDoc = true;
  for (i = 0; i < doc.length; i++) {
    if (doc[i].stmt === "relation") {
      edgeFreeDoc = false;
      break;
    }
  }
  if (parentId) {
    graph.setGraph({
      rankdir: "LR",
      multigraph: true,
      compound: true,
      // acyclicer: 'greedy',
      ranker: "tight-tree",
      ranksep: edgeFreeDoc ? 1 : conf.edgeLengthFactor,
      nodeSep: edgeFreeDoc ? 1 : 50,
      isMultiGraph: true
      // ranksep: 5,
      // nodesep: 1
    });
  } else {
    graph.setGraph({
      rankdir: "TB",
      multigraph: true,
      compound: true,
      // isCompound: true,
      // acyclicer: 'greedy',
      // ranker: 'longest-path'
      ranksep: edgeFreeDoc ? 1 : conf.edgeLengthFactor,
      nodeSep: edgeFreeDoc ? 1 : 50,
      ranker: "tight-tree",
      // ranker: 'network-simplex'
      isMultiGraph: true
    });
  }
  graph.setDefaultEdgeLabel(function () {
    return {};
  });
  diagObj.db.extract(doc);
  const states = diagObj.db.getStates();
  const relations = diagObj.db.getRelations();
  const keys2 = Object.keys(states);
  for (const key of keys2) {
    const stateDef = states[key];
    if (parentId) {
      stateDef.parentId = parentId;
    }
    let node;
    if (stateDef.doc) {
      let sub = diagram2.append("g").attr("id", stateDef.id).attr("class", "stateGroup");
      node = renderDoc(stateDef.doc, sub, stateDef.id, !altBkg, root, domDocument, diagObj);
      {
        sub = addTitleAndBox(sub, stateDef, altBkg);
        let boxBounds = sub.node().getBBox();
        node.width = boxBounds.width;
        node.height = boxBounds.height + conf.padding / 2;
        transformationLog[stateDef.id] = {
          y: conf.compositTitleSize
        };
      }
    } else {
      node = drawState(diagram2, stateDef);
    }
    if (stateDef.note) {
      const noteDef = {
        descriptions: [],
        id: stateDef.id + "-note",
        note: stateDef.note,
        type: "note"
      };
      const note = drawState(diagram2, noteDef);
      if (stateDef.note.position === "left of") {
        graph.setNode(node.id + "-note", note);
        graph.setNode(node.id, node);
      } else {
        graph.setNode(node.id, node);
        graph.setNode(node.id + "-note", note);
      }
      graph.setParent(node.id, node.id + "-group");
      graph.setParent(node.id + "-note", node.id + "-group");
    } else {
      graph.setNode(node.id, node);
    }
  }
  _commonDb573409be.l.debug("Count=", graph.nodeCount(), graph);
  let cnt = 0;
  relations.forEach(function (relation) {
    cnt++;
    _commonDb573409be.l.debug("Setting edge", relation);
    graph.setEdge(relation.id1, relation.id2, {
      relation,
      width: getLabelWidth(relation.title),
      height: conf.labelHeight * _commonDb573409be.e.getRows(relation.title).length,
      labelpos: "c"
    }, "id" + cnt);
  });
  (0, _index.layout)(graph);
  _commonDb573409be.l.debug("Graph after layout", graph.nodes());
  const svgElem = diagram2.node();
  graph.nodes().forEach(function (v) {
    if (v !== void 0 && graph.node(v) !== void 0) {
      _commonDb573409be.l.warn("Node " + v + ": " + JSON.stringify(graph.node(v)));
      root.select("#" + svgElem.id + " #" + v).attr("transform", "translate(" + (graph.node(v).x - graph.node(v).width / 2) + "," + (graph.node(v).y + (transformationLog[v] ? transformationLog[v].y : 0) - graph.node(v).height / 2) + " )");
      root.select("#" + svgElem.id + " #" + v).attr("data-x-shift", graph.node(v).x - graph.node(v).width / 2);
      const dividers = domDocument.querySelectorAll("#" + svgElem.id + " #" + v + " .divider");
      dividers.forEach(divider => {
        const parent = divider.parentElement;
        let pWidth = 0;
        let pShift = 0;
        if (parent) {
          if (parent.parentElement) {
            pWidth = parent.parentElement.getBBox().width;
          }
          pShift = parseInt(parent.getAttribute("data-x-shift"), 10);
          if (Number.isNaN(pShift)) {
            pShift = 0;
          }
        }
        divider.setAttribute("x1", 0 - pShift + 8);
        divider.setAttribute("x2", pWidth - pShift - 8);
      });
    } else {
      _commonDb573409be.l.debug("No Node " + v + ": " + JSON.stringify(graph.node(v)));
    }
  });
  let stateBox = svgElem.getBBox();
  graph.edges().forEach(function (e) {
    if (e !== void 0 && graph.edge(e) !== void 0) {
      _commonDb573409be.l.debug("Edge " + e.v + " -> " + e.w + ": " + JSON.stringify(graph.edge(e)));
      drawEdge(diagram2, graph.edge(e), graph.edge(e).relation);
    }
  });
  stateBox = svgElem.getBBox();
  const stateInfo = {
    id: parentId ? parentId : "root",
    label: parentId ? parentId : "root",
    width: 0,
    height: 0
  };
  stateInfo.width = stateBox.width + 2 * conf.padding;
  stateInfo.height = stateBox.height + 2 * conf.padding;
  _commonDb573409be.l.debug("Doc rendered", stateInfo, graph);
  return stateInfo;
};
const renderer = {
  setConf,
  draw
};
const diagram = {
  parser: _styles47a825a.p,
  db: _styles47a825a.d,
  renderer,
  styles: _styles47a825a.s,
  init: cnf => {
    if (!cnf.state) {
      cnf.state = {};
    }
    cnf.state.arrowMarkerAbsolute = cnf.arrowMarkerAbsolute;
    _styles47a825a.d.clear();
  }
};
exports.diagram = diagram;
},{"./styles-47a825a5.js":"node_modules/mermaid/dist/styles-47a825a5.js","d3":"node_modules/d3/src/index.js","dagre-d3-es/src/dagre/index.js":"node_modules/dagre-d3-es/src/dagre/index.js","dagre-d3-es/src/graphlib/index.js":"node_modules/dagre-d3-es/src/graphlib/index.js","./commonDb-573409be.js":"node_modules/mermaid/dist/commonDb-573409be.js","./utils-d622194a.js":"node_modules/mermaid/dist/utils-d622194a.js","./mermaidAPI-3ae0f2f0.js":"node_modules/mermaid/dist/mermaidAPI-3ae0f2f0.js","stylis":"node_modules/stylis/dist/stylis.mjs","dompurify":"node_modules/dompurify/dist/purify.js","lodash-es/isEmpty.js":"node_modules/lodash-es/isEmpty.js","dayjs":"node_modules/dayjs/dayjs.min.js","khroma":"node_modules/khroma/dist/index.js","@braintree/sanitize-url":"node_modules/@braintree/sanitize-url/dist/index.js","lodash-es/memoize.js":"node_modules/lodash-es/memoize.js"}],"node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
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
//# sourceMappingURL=/stateDiagram-d53d2428.47fadbee.js.map
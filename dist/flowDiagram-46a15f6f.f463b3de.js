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
})({"node_modules/dagre-d3-es/src/dagre-js/arrows.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.arrows = void 0;
exports.setArrows = setArrows;
var util = _interopRequireWildcard(require("./util.js"));
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
var arrows = {
  normal,
  vee,
  undirected
};
exports.arrows = arrows;
function setArrows(value) {
  exports.arrows = arrows = value;
}
function normal(parent, id, edge, type) {
  var marker = parent.append('marker').attr('id', id).attr('viewBox', '0 0 10 10').attr('refX', 9).attr('refY', 5).attr('markerUnits', 'strokeWidth').attr('markerWidth', 8).attr('markerHeight', 6).attr('orient', 'auto');
  var path = marker.append('path').attr('d', 'M 0 0 L 10 5 L 0 10 z').style('stroke-width', 1).style('stroke-dasharray', '1,0');
  util.applyStyle(path, edge[type + 'Style']);
  if (edge[type + 'Class']) {
    path.attr('class', edge[type + 'Class']);
  }
}
function vee(parent, id, edge, type) {
  var marker = parent.append('marker').attr('id', id).attr('viewBox', '0 0 10 10').attr('refX', 9).attr('refY', 5).attr('markerUnits', 'strokeWidth').attr('markerWidth', 8).attr('markerHeight', 6).attr('orient', 'auto');
  var path = marker.append('path').attr('d', 'M 0 0 L 10 5 L 0 10 L 4 5 z').style('stroke-width', 1).style('stroke-dasharray', '1,0');
  util.applyStyle(path, edge[type + 'Style']);
  if (edge[type + 'Class']) {
    path.attr('class', edge[type + 'Class']);
  }
}
function undirected(parent, id, edge, type) {
  var marker = parent.append('marker').attr('id', id).attr('viewBox', '0 0 10 10').attr('refX', 9).attr('refY', 5).attr('markerUnits', 'strokeWidth').attr('markerWidth', 8).attr('markerHeight', 6).attr('orient', 'auto');
  var path = marker.append('path').attr('d', 'M 0 5 L 10 5').style('stroke-width', 1).style('stroke-dasharray', '1,0');
  util.applyStyle(path, edge[type + 'Style']);
  if (edge[type + 'Class']) {
    path.attr('class', edge[type + 'Class']);
  }
}
},{"./util.js":"node_modules/dagre-d3-es/src/dagre-js/util.js"}],"node_modules/dagre-d3-es/src/dagre-js/label/add-svg-label.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addSVGLabel = addSVGLabel;
var util = _interopRequireWildcard(require("../util.js"));
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
function addSVGLabel(root, node) {
  var domNode = root;
  domNode.node().appendChild(node.label);
  util.applyStyle(domNode, node.labelStyle);
  return domNode;
}
},{"../util.js":"node_modules/dagre-d3-es/src/dagre-js/util.js"}],"node_modules/dagre-d3-es/src/dagre-js/label/add-text-label.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addTextLabel = addTextLabel;
var util = _interopRequireWildcard(require("../util.js"));
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
/*
 * Attaches a text label to the specified root. Handles escape sequences.
 */
function addTextLabel(root, node) {
  var domNode = root.append('text');
  var lines = processEscapeSequences(node.label).split('\n');
  for (var i = 0; i < lines.length; i++) {
    domNode.append('tspan').attr('xml:space', 'preserve').attr('dy', '1em').attr('x', '1').text(lines[i]);
  }
  util.applyStyle(domNode, node.labelStyle);
  return domNode;
}
function processEscapeSequences(text) {
  var newText = '';
  var escaped = false;
  var ch;
  for (var i = 0; i < text.length; ++i) {
    ch = text[i];
    if (escaped) {
      switch (ch) {
        case 'n':
          newText += '\n';
          break;
        default:
          newText += ch;
      }
      escaped = false;
    } else if (ch === '\\') {
      escaped = true;
    } else {
      newText += ch;
    }
  }
  return newText;
}
},{"../util.js":"node_modules/dagre-d3-es/src/dagre-js/util.js"}],"node_modules/dagre-d3-es/src/dagre-js/label/add-label.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addLabel = addLabel;
var _addHtmlLabel = require("./add-html-label.js");
var _addSvgLabel = require("./add-svg-label.js");
var _addTextLabel = require("./add-text-label.js");
function addLabel(root, node, location) {
  var label = node.label;
  var labelSvg = root.append('g');

  // Allow the label to be a string, a function that returns a DOM element, or
  // a DOM element itself.
  if (node.labelType === 'svg') {
    (0, _addSvgLabel.addSVGLabel)(labelSvg, node);
  } else if (typeof label !== 'string' || node.labelType === 'html') {
    (0, _addHtmlLabel.addHtmlLabel)(labelSvg, node);
  } else {
    (0, _addTextLabel.addTextLabel)(labelSvg, node);
  }
  var labelBBox = labelSvg.node().getBBox();
  var y;
  switch (location) {
    case 'top':
      y = -node.height / 2;
      break;
    case 'bottom':
      y = node.height / 2 - labelBBox.height;
      break;
    default:
      y = -labelBBox.height / 2;
  }
  labelSvg.attr('transform', 'translate(' + -labelBBox.width / 2 + ',' + y + ')');
  return labelSvg;
}
},{"./add-html-label.js":"node_modules/dagre-d3-es/src/dagre-js/label/add-html-label.js","./add-svg-label.js":"node_modules/dagre-d3-es/src/dagre-js/label/add-svg-label.js","./add-text-label.js":"node_modules/dagre-d3-es/src/dagre-js/label/add-text-label.js"}],"node_modules/dagre-d3-es/src/dagre-js/create-clusters.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createClusters = void 0;
exports.setCreateClusters = setCreateClusters;
var d3 = _interopRequireWildcard(require("d3"));
var _addLabel = require("./label/add-label.js");
var util = _interopRequireWildcard(require("./util.js"));
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
var createClusters = function (selection, g) {
  var clusters = g.nodes().filter(function (v) {
    return util.isSubgraph(g, v);
  });
  var svgClusters = selection.selectAll('g.cluster').data(clusters, function (v) {
    return v;
  });
  util.applyTransition(svgClusters.exit(), g).style('opacity', 0).remove();
  var enterSelection = svgClusters.enter().append('g').attr('class', 'cluster').attr('id', function (v) {
    var node = g.node(v);
    return node.id;
  }).style('opacity', 0).each(function (v) {
    var node = g.node(v);
    var thisGroup = d3.select(this);
    d3.select(this).append('rect');
    var labelGroup = thisGroup.append('g').attr('class', 'label');
    (0, _addLabel.addLabel)(labelGroup, node, node.clusterLabelPos);
  });
  svgClusters = svgClusters.merge(enterSelection);
  svgClusters = util.applyTransition(svgClusters, g).style('opacity', 1);
  svgClusters.selectAll('rect').each(function (c) {
    var node = g.node(c);
    var domCluster = d3.select(this);
    util.applyStyle(domCluster, node.style);
  });
  return svgClusters;
};
exports.createClusters = createClusters;
function setCreateClusters(value) {
  exports.createClusters = createClusters = value;
}
},{"d3":"node_modules/d3/src/index.js","./label/add-label.js":"node_modules/dagre-d3-es/src/dagre-js/label/add-label.js","./util.js":"node_modules/dagre-d3-es/src/dagre-js/util.js"}],"node_modules/dagre-d3-es/src/dagre-js/create-edge-labels.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createEdgeLabels = void 0;
exports.setCreateEdgeLabels = setCreateEdgeLabels;
var d3 = _interopRequireWildcard(require("d3"));
var _ = _interopRequireWildcard(require("lodash-es"));
var _addLabel = require("./label/add-label.js");
var util = _interopRequireWildcard(require("./util.js"));
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
let createEdgeLabels = function (selection, g) {
  var svgEdgeLabels = selection.selectAll('g.edgeLabel').data(g.edges(), function (e) {
    return util.edgeToId(e);
  }).classed('update', true);
  svgEdgeLabels.exit().remove();
  svgEdgeLabels.enter().append('g').classed('edgeLabel', true).style('opacity', 0);
  svgEdgeLabels = selection.selectAll('g.edgeLabel');
  svgEdgeLabels.each(function (e) {
    var root = d3.select(this);
    root.select('.label').remove();
    var edge = g.edge(e);
    var label = (0, _addLabel.addLabel)(root, g.edge(e), 0).classed('label', true);
    var bbox = label.node().getBBox();
    if (edge.labelId) {
      label.attr('id', edge.labelId);
    }
    if (!_.has(edge, 'width')) {
      edge.width = bbox.width;
    }
    if (!_.has(edge, 'height')) {
      edge.height = bbox.height;
    }
  });
  var exitSelection;
  if (svgEdgeLabels.exit) {
    exitSelection = svgEdgeLabels.exit();
  } else {
    exitSelection = svgEdgeLabels.selectAll(null); // empty selection
  }

  util.applyTransition(exitSelection, g).style('opacity', 0).remove();
  return svgEdgeLabels;
};
exports.createEdgeLabels = createEdgeLabels;
function setCreateEdgeLabels(value) {
  exports.createEdgeLabels = createEdgeLabels = value;
}
},{"d3":"node_modules/d3/src/index.js","lodash-es":"node_modules/lodash-es/lodash.js","./label/add-label.js":"node_modules/dagre-d3-es/src/dagre-js/label/add-label.js","./util.js":"node_modules/dagre-d3-es/src/dagre-js/util.js"}],"node_modules/dagre-d3-es/src/dagre-js/intersect/intersect-node.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.intersectNode = intersectNode;
function intersectNode(node, point) {
  return node.intersect(point);
}
},{}],"node_modules/dagre-d3-es/src/dagre-js/create-edge-paths.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createEdgePaths = void 0;
exports.setCreateEdgePaths = setCreateEdgePaths;
var d3 = _interopRequireWildcard(require("d3"));
var _ = _interopRequireWildcard(require("lodash-es"));
var _intersectNode = require("./intersect/intersect-node.js");
var util = _interopRequireWildcard(require("./util.js"));
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
var createEdgePaths = function (selection, g, arrows) {
  var previousPaths = selection.selectAll('g.edgePath').data(g.edges(), function (e) {
    return util.edgeToId(e);
  }).classed('update', true);
  var newPaths = enter(previousPaths, g);
  exit(previousPaths, g);
  var svgPaths = previousPaths.merge !== undefined ? previousPaths.merge(newPaths) : previousPaths;
  util.applyTransition(svgPaths, g).style('opacity', 1);

  // Save DOM element in the path group, and set ID and class
  svgPaths.each(function (e) {
    var domEdge = d3.select(this);
    var edge = g.edge(e);
    edge.elem = this;
    if (edge.id) {
      domEdge.attr('id', edge.id);
    }
    util.applyClass(domEdge, edge['class'], (domEdge.classed('update') ? 'update ' : '') + 'edgePath');
  });
  svgPaths.selectAll('path.path').each(function (e) {
    var edge = g.edge(e);
    edge.arrowheadId = _.uniqueId('arrowhead');
    var domEdge = d3.select(this).attr('marker-end', function () {
      return 'url(' + makeFragmentRef(location.href, edge.arrowheadId) + ')';
    }).style('fill', 'none');
    util.applyTransition(domEdge, g).attr('d', function (e) {
      return calcPoints(g, e);
    });
    util.applyStyle(domEdge, edge.style);
  });
  svgPaths.selectAll('defs *').remove();
  svgPaths.selectAll('defs').each(function (e) {
    var edge = g.edge(e);
    var arrowhead = arrows[edge.arrowhead];
    arrowhead(d3.select(this), edge.arrowheadId, edge, 'arrowhead');
  });
  return svgPaths;
};
exports.createEdgePaths = createEdgePaths;
function setCreateEdgePaths(value) {
  exports.createEdgePaths = createEdgePaths = value;
}
function makeFragmentRef(url, fragmentId) {
  var baseUrl = url.split('#')[0];
  return baseUrl + '#' + fragmentId;
}
function calcPoints(g, e) {
  var edge = g.edge(e);
  var tail = g.node(e.v);
  var head = g.node(e.w);
  var points = edge.points.slice(1, edge.points.length - 1);
  points.unshift((0, _intersectNode.intersectNode)(tail, points[0]));
  points.push((0, _intersectNode.intersectNode)(head, points[points.length - 1]));
  return createLine(edge, points);
}
function createLine(edge, points) {
  // @ts-expect-error
  var line = (d3.line || d3.svg.line)().x(function (d) {
    return d.x;
  }).y(function (d) {
    return d.y;
  });
  (line.curve || line.interpolate)(edge.curve);
  return line(points);
}
function getCoords(elem) {
  var bbox = elem.getBBox();
  var matrix = elem.ownerSVGElement.getScreenCTM().inverse().multiply(elem.getScreenCTM()).translate(bbox.width / 2, bbox.height / 2);
  return {
    x: matrix.e,
    y: matrix.f
  };
}
function enter(svgPaths, g) {
  var svgPathsEnter = svgPaths.enter().append('g').attr('class', 'edgePath').style('opacity', 0);
  svgPathsEnter.append('path').attr('class', 'path').attr('d', function (e) {
    var edge = g.edge(e);
    var sourceElem = g.node(e.v).elem;
    var points = _.range(edge.points.length).map(function () {
      return getCoords(sourceElem);
    });
    return createLine(edge, points);
  });
  svgPathsEnter.append('defs');
  return svgPathsEnter;
}
function exit(svgPaths, g) {
  var svgPathExit = svgPaths.exit();
  util.applyTransition(svgPathExit, g).style('opacity', 0).remove();
}
},{"d3":"node_modules/d3/src/index.js","lodash-es":"node_modules/lodash-es/lodash.js","./intersect/intersect-node.js":"node_modules/dagre-d3-es/src/dagre-js/intersect/intersect-node.js","./util.js":"node_modules/dagre-d3-es/src/dagre-js/util.js"}],"node_modules/dagre-d3-es/src/dagre-js/create-nodes.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createNodes = void 0;
exports.setCreateNodes = setCreateNodes;
var d3 = _interopRequireWildcard(require("d3"));
var _ = _interopRequireWildcard(require("lodash-es"));
var _addLabel = require("./label/add-label.js");
var util = _interopRequireWildcard(require("./util.js"));
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
var createNodes = function (selection, g, shapes) {
  var simpleNodes = g.nodes().filter(function (v) {
    return !util.isSubgraph(g, v);
  });
  var svgNodes = selection.selectAll('g.node').data(simpleNodes, function (v) {
    return v;
  }).classed('update', true);
  svgNodes.exit().remove();
  svgNodes.enter().append('g').attr('class', 'node').style('opacity', 0);
  svgNodes = selection.selectAll('g.node');
  svgNodes.each(function (v) {
    var node = g.node(v);
    var thisGroup = d3.select(this);
    util.applyClass(thisGroup, node['class'], (thisGroup.classed('update') ? 'update ' : '') + 'node');
    thisGroup.select('g.label').remove();
    var labelGroup = thisGroup.append('g').attr('class', 'label');
    var labelDom = (0, _addLabel.addLabel)(labelGroup, node);
    var shape = shapes[node.shape];
    var bbox = _.pick(labelDom.node().getBBox(), 'width', 'height');
    node.elem = this;
    if (node.id) {
      thisGroup.attr('id', node.id);
    }
    if (node.labelId) {
      labelGroup.attr('id', node.labelId);
    }
    if (_.has(node, 'width')) {
      bbox.width = node.width;
    }
    if (_.has(node, 'height')) {
      bbox.height = node.height;
    }
    bbox.width += node.paddingLeft + node.paddingRight;
    bbox.height += node.paddingTop + node.paddingBottom;
    labelGroup.attr('transform', 'translate(' + (node.paddingLeft - node.paddingRight) / 2 + ',' + (node.paddingTop - node.paddingBottom) / 2 + ')');
    var root = d3.select(this);
    root.select('.label-container').remove();
    var shapeSvg = shape(root, bbox, node).classed('label-container', true);
    util.applyStyle(shapeSvg, node.style);
    var shapeBBox = shapeSvg.node().getBBox();
    node.width = shapeBBox.width;
    node.height = shapeBBox.height;
  });
  var exitSelection;
  if (svgNodes.exit) {
    exitSelection = svgNodes.exit();
  } else {
    exitSelection = svgNodes.selectAll(null); // empty selection
  }

  util.applyTransition(exitSelection, g).style('opacity', 0).remove();
  return svgNodes;
};
exports.createNodes = createNodes;
function setCreateNodes(value) {
  exports.createNodes = createNodes = value;
}
},{"d3":"node_modules/d3/src/index.js","lodash-es":"node_modules/lodash-es/lodash.js","./label/add-label.js":"node_modules/dagre-d3-es/src/dagre-js/label/add-label.js","./util.js":"node_modules/dagre-d3-es/src/dagre-js/util.js"}],"node_modules/dagre-d3-es/src/dagre-js/position-clusters.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.positionClusters = positionClusters;
var d3 = _interopRequireWildcard(require("d3"));
var util = _interopRequireWildcard(require("./util.js"));
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
function positionClusters(selection, g) {
  var created = selection.filter(function () {
    return !d3.select(this).classed('update');
  });
  function translate(v) {
    var node = g.node(v);
    return 'translate(' + node.x + ',' + node.y + ')';
  }
  created.attr('transform', translate);
  util.applyTransition(selection, g).style('opacity', 1).attr('transform', translate);
  util.applyTransition(created.selectAll('rect'), g).attr('width', function (v) {
    return g.node(v).width;
  }).attr('height', function (v) {
    return g.node(v).height;
  }).attr('x', function (v) {
    var node = g.node(v);
    return -node.width / 2;
  }).attr('y', function (v) {
    var node = g.node(v);
    return -node.height / 2;
  });
}
},{"d3":"node_modules/d3/src/index.js","./util.js":"node_modules/dagre-d3-es/src/dagre-js/util.js"}],"node_modules/dagre-d3-es/src/dagre-js/position-edge-labels.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.positionEdgeLabels = positionEdgeLabels;
var d3 = _interopRequireWildcard(require("d3"));
var _ = _interopRequireWildcard(require("lodash-es"));
var util = _interopRequireWildcard(require("./util.js"));
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
function positionEdgeLabels(selection, g) {
  var created = selection.filter(function () {
    return !d3.select(this).classed('update');
  });
  function translate(e) {
    var edge = g.edge(e);
    return _.has(edge, 'x') ? 'translate(' + edge.x + ',' + edge.y + ')' : '';
  }
  created.attr('transform', translate);
  util.applyTransition(selection, g).style('opacity', 1).attr('transform', translate);
}
},{"d3":"node_modules/d3/src/index.js","lodash-es":"node_modules/lodash-es/lodash.js","./util.js":"node_modules/dagre-d3-es/src/dagre-js/util.js"}],"node_modules/dagre-d3-es/src/dagre-js/position-nodes.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.positionNodes = positionNodes;
var d3 = _interopRequireWildcard(require("d3"));
var util = _interopRequireWildcard(require("./util.js"));
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
function positionNodes(selection, g) {
  var created = selection.filter(function () {
    return !d3.select(this).classed('update');
  });
  function translate(v) {
    var node = g.node(v);
    return 'translate(' + node.x + ',' + node.y + ')';
  }
  created.attr('transform', translate);
  util.applyTransition(selection, g).style('opacity', 1).attr('transform', translate);
}
},{"d3":"node_modules/d3/src/index.js","./util.js":"node_modules/dagre-d3-es/src/dagre-js/util.js"}],"node_modules/dagre-d3-es/src/dagre-js/intersect/intersect-ellipse.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.intersectEllipse = intersectEllipse;
function intersectEllipse(node, rx, ry, point) {
  // Formulae from: http://mathworld.wolfram.com/Ellipse-LineIntersection.html

  var cx = node.x;
  var cy = node.y;
  var px = cx - point.x;
  var py = cy - point.y;
  var det = Math.sqrt(rx * rx * py * py + ry * ry * px * px);
  var dx = Math.abs(rx * ry * px / det);
  if (point.x < cx) {
    dx = -dx;
  }
  var dy = Math.abs(rx * ry * py / det);
  if (point.y < cy) {
    dy = -dy;
  }
  return {
    x: cx + dx,
    y: cy + dy
  };
}
},{}],"node_modules/dagre-d3-es/src/dagre-js/intersect/intersect-circle.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.intersectCircle = intersectCircle;
var _intersectEllipse = require("./intersect-ellipse.js");
function intersectCircle(node, rx, point) {
  return (0, _intersectEllipse.intersectEllipse)(node, rx, rx, point);
}
},{"./intersect-ellipse.js":"node_modules/dagre-d3-es/src/dagre-js/intersect/intersect-ellipse.js"}],"node_modules/dagre-d3-es/src/dagre-js/intersect/intersect-line.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.intersectLine = intersectLine;
/*
 * Returns the point at which two lines, p and q, intersect or returns
 * undefined if they do not intersect.
 */
function intersectLine(p1, p2, q1, q2) {
  // Algorithm from J. Avro, (ed.) Graphics Gems, No 2, Morgan Kaufmann, 1994,
  // p7 and p473.

  var a1, a2, b1, b2, c1, c2;
  var r1, r2, r3, r4;
  var denom, offset, num;
  var x, y;

  // Compute a1, b1, c1, where line joining points 1 and 2 is F(x,y) = a1 x +
  // b1 y + c1 = 0.
  a1 = p2.y - p1.y;
  b1 = p1.x - p2.x;
  c1 = p2.x * p1.y - p1.x * p2.y;

  // Compute r3 and r4.
  r3 = a1 * q1.x + b1 * q1.y + c1;
  r4 = a1 * q2.x + b1 * q2.y + c1;

  // Check signs of r3 and r4. If both point 3 and point 4 lie on
  // same side of line 1, the line segments do not intersect.
  if (r3 !== 0 && r4 !== 0 && sameSign(r3, r4)) {
    return; /*DONT_INTERSECT*/
  }

  // Compute a2, b2, c2 where line joining points 3 and 4 is G(x,y) = a2 x + b2 y + c2 = 0
  a2 = q2.y - q1.y;
  b2 = q1.x - q2.x;
  c2 = q2.x * q1.y - q1.x * q2.y;

  // Compute r1 and r2
  r1 = a2 * p1.x + b2 * p1.y + c2;
  r2 = a2 * p2.x + b2 * p2.y + c2;

  // Check signs of r1 and r2. If both point 1 and point 2 lie
  // on same side of second line segment, the line segments do
  // not intersect.
  if (r1 !== 0 && r2 !== 0 && sameSign(r1, r2)) {
    return; /*DONT_INTERSECT*/
  }

  // Line segments intersect: compute intersection point.
  denom = a1 * b2 - a2 * b1;
  if (denom === 0) {
    return; /*COLLINEAR*/
  }

  offset = Math.abs(denom / 2);

  // The denom/2 is to get rounding instead of truncating. It
  // is added or subtracted to the numerator, depending upon the
  // sign of the numerator.
  num = b1 * c2 - b2 * c1;
  x = num < 0 ? (num - offset) / denom : (num + offset) / denom;
  num = a2 * c1 - a1 * c2;
  y = num < 0 ? (num - offset) / denom : (num + offset) / denom;
  return {
    x: x,
    y: y
  };
}
function sameSign(r1, r2) {
  return r1 * r2 > 0;
}
},{}],"node_modules/dagre-d3-es/src/dagre-js/intersect/intersect-polygon.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.intersectPolygon = intersectPolygon;
var _intersectLine = require("./intersect-line.js");
/*
 * Returns the point ({x, y}) at which the point argument intersects with the
 * node argument assuming that it has the shape specified by polygon.
 */
function intersectPolygon(node, polyPoints, point) {
  var x1 = node.x;
  var y1 = node.y;
  var intersections = [];
  var minX = Number.POSITIVE_INFINITY;
  var minY = Number.POSITIVE_INFINITY;
  polyPoints.forEach(function (entry) {
    minX = Math.min(minX, entry.x);
    minY = Math.min(minY, entry.y);
  });
  var left = x1 - node.width / 2 - minX;
  var top = y1 - node.height / 2 - minY;
  for (var i = 0; i < polyPoints.length; i++) {
    var p1 = polyPoints[i];
    var p2 = polyPoints[i < polyPoints.length - 1 ? i + 1 : 0];
    var intersect = (0, _intersectLine.intersectLine)(node, point, {
      x: left + p1.x,
      y: top + p1.y
    }, {
      x: left + p2.x,
      y: top + p2.y
    });
    if (intersect) {
      intersections.push(intersect);
    }
  }
  if (!intersections.length) {
    console.log('NO INTERSECTION FOUND, RETURN NODE CENTER', node);
    return node;
  }
  if (intersections.length > 1) {
    // More intersections, find the one nearest to edge end point
    intersections.sort(function (p, q) {
      var pdx = p.x - point.x;
      var pdy = p.y - point.y;
      var distp = Math.sqrt(pdx * pdx + pdy * pdy);
      var qdx = q.x - point.x;
      var qdy = q.y - point.y;
      var distq = Math.sqrt(qdx * qdx + qdy * qdy);
      return distp < distq ? -1 : distp === distq ? 0 : 1;
    });
  }
  return intersections[0];
}
},{"./intersect-line.js":"node_modules/dagre-d3-es/src/dagre-js/intersect/intersect-line.js"}],"node_modules/dagre-d3-es/src/dagre-js/intersect/intersect-rect.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.intersectRect = intersectRect;
function intersectRect(node, point) {
  var x = node.x;
  var y = node.y;

  // Rectangle intersection algorithm from:
  // http://math.stackexchange.com/questions/108113/find-edge-between-two-boxes
  var dx = point.x - x;
  var dy = point.y - y;
  var w = node.width / 2;
  var h = node.height / 2;
  var sx, sy;
  if (Math.abs(dy) * w > Math.abs(dx) * h) {
    // Intersection is top or bottom of rect.
    if (dy < 0) {
      h = -h;
    }
    sx = dy === 0 ? 0 : h * dx / dy;
    sy = h;
  } else {
    // Intersection is left or right of rect.
    if (dx < 0) {
      w = -w;
    }
    sx = w;
    sy = dx === 0 ? 0 : w * dy / dx;
  }
  return {
    x: x + sx,
    y: y + sy
  };
}
},{}],"node_modules/dagre-d3-es/src/dagre-js/shapes.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setShapes = setShapes;
exports.shapes = void 0;
var _intersectCircle = require("./intersect/intersect-circle.js");
var _intersectEllipse = require("./intersect/intersect-ellipse.js");
var _intersectPolygon = require("./intersect/intersect-polygon.js");
var _intersectRect = require("./intersect/intersect-rect.js");
var shapes = {
  rect,
  ellipse,
  circle,
  diamond
};
exports.shapes = shapes;
function setShapes(value) {
  exports.shapes = shapes = value;
}
function rect(parent, bbox, node) {
  var shapeSvg = parent.insert('rect', ':first-child').attr('rx', node.rx).attr('ry', node.ry).attr('x', -bbox.width / 2).attr('y', -bbox.height / 2).attr('width', bbox.width).attr('height', bbox.height);
  node.intersect = function (point) {
    return (0, _intersectRect.intersectRect)(node, point);
  };
  return shapeSvg;
}
function ellipse(parent, bbox, node) {
  var rx = bbox.width / 2;
  var ry = bbox.height / 2;
  var shapeSvg = parent.insert('ellipse', ':first-child').attr('x', -bbox.width / 2).attr('y', -bbox.height / 2).attr('rx', rx).attr('ry', ry);
  node.intersect = function (point) {
    return (0, _intersectEllipse.intersectEllipse)(node, rx, ry, point);
  };
  return shapeSvg;
}
function circle(parent, bbox, node) {
  var r = Math.max(bbox.width, bbox.height) / 2;
  var shapeSvg = parent.insert('circle', ':first-child').attr('x', -bbox.width / 2).attr('y', -bbox.height / 2).attr('r', r);
  node.intersect = function (point) {
    return (0, _intersectCircle.intersectCircle)(node, r, point);
  };
  return shapeSvg;
}

// Circumscribe an ellipse for the bounding box with a diamond shape. I derived
// the function to calculate the diamond shape from:
// http://mathforum.org/kb/message.jspa?messageID=3750236
function diamond(parent, bbox, node) {
  var w = bbox.width * Math.SQRT2 / 2;
  var h = bbox.height * Math.SQRT2 / 2;
  var points = [{
    x: 0,
    y: -h
  }, {
    x: -w,
    y: 0
  }, {
    x: 0,
    y: h
  }, {
    x: w,
    y: 0
  }];
  var shapeSvg = parent.insert('polygon', ':first-child').attr('points', points.map(function (p) {
    return p.x + ',' + p.y;
  }).join(' '));
  node.intersect = function (p) {
    return (0, _intersectPolygon.intersectPolygon)(node, points, p);
  };
  return shapeSvg;
}
},{"./intersect/intersect-circle.js":"node_modules/dagre-d3-es/src/dagre-js/intersect/intersect-circle.js","./intersect/intersect-ellipse.js":"node_modules/dagre-d3-es/src/dagre-js/intersect/intersect-ellipse.js","./intersect/intersect-polygon.js":"node_modules/dagre-d3-es/src/dagre-js/intersect/intersect-polygon.js","./intersect/intersect-rect.js":"node_modules/dagre-d3-es/src/dagre-js/intersect/intersect-rect.js"}],"node_modules/dagre-d3-es/src/dagre-js/render.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.render = render;
var d3 = _interopRequireWildcard(require("d3"));
var _ = _interopRequireWildcard(require("lodash-es"));
var _index = require("../dagre/index.js");
var _arrows = require("./arrows.js");
var _createClusters = require("./create-clusters.js");
var _createEdgeLabels = require("./create-edge-labels.js");
var _createEdgePaths = require("./create-edge-paths.js");
var _createNodes = require("./create-nodes.js");
var _positionClusters = require("./position-clusters.js");
var _positionEdgeLabels = require("./position-edge-labels.js");
var _positionNodes = require("./position-nodes.js");
var _shapes = require("./shapes.js");
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
// This design is based on http://bost.ocks.org/mike/chart/.
function render() {
  var fn = function (svg, g) {
    preProcessGraph(g);
    var outputGroup = createOrSelectGroup(svg, 'output');
    var clustersGroup = createOrSelectGroup(outputGroup, 'clusters');
    var edgePathsGroup = createOrSelectGroup(outputGroup, 'edgePaths');
    var edgeLabels = (0, _createEdgeLabels.createEdgeLabels)(createOrSelectGroup(outputGroup, 'edgeLabels'), g);
    var nodes = (0, _createNodes.createNodes)(createOrSelectGroup(outputGroup, 'nodes'), g, _shapes.shapes);
    (0, _index.layout)(g);
    (0, _positionNodes.positionNodes)(nodes, g);
    (0, _positionEdgeLabels.positionEdgeLabels)(edgeLabels, g);
    (0, _createEdgePaths.createEdgePaths)(edgePathsGroup, g, _arrows.arrows);
    var clusters = (0, _createClusters.createClusters)(clustersGroup, g);
    (0, _positionClusters.positionClusters)(clusters, g);
    postProcessGraph(g);
  };
  fn.createNodes = function (value) {
    if (!arguments.length) return _createNodes.createNodes;
    (0, _createNodes.setCreateNodes)(value);
    return fn;
  };
  fn.createClusters = function (value) {
    if (!arguments.length) return _createClusters.createClusters;
    (0, _createClusters.setCreateClusters)(value);
    return fn;
  };
  fn.createEdgeLabels = function (value) {
    if (!arguments.length) return _createEdgeLabels.createEdgeLabels;
    (0, _createEdgeLabels.setCreateEdgeLabels)(value);
    return fn;
  };
  fn.createEdgePaths = function (value) {
    if (!arguments.length) return _createEdgePaths.createEdgePaths;
    (0, _createEdgePaths.setCreateEdgePaths)(value);
    return fn;
  };
  fn.shapes = function (value) {
    if (!arguments.length) return _shapes.shapes;
    (0, _shapes.setShapes)(value);
    return fn;
  };
  fn.arrows = function (value) {
    if (!arguments.length) return _arrows.arrows;
    (0, _arrows.setArrows)(value);
    return fn;
  };
  return fn;
}
var NODE_DEFAULT_ATTRS = {
  paddingLeft: 10,
  paddingRight: 10,
  paddingTop: 10,
  paddingBottom: 10,
  rx: 0,
  ry: 0,
  shape: 'rect'
};
var EDGE_DEFAULT_ATTRS = {
  arrowhead: 'normal',
  curve: d3.curveLinear
};
function preProcessGraph(g) {
  g.nodes().forEach(function (v) {
    var node = g.node(v);
    if (!_.has(node, 'label') && !g.children(v).length) {
      node.label = v;
    }
    if (_.has(node, 'paddingX')) {
      _.defaults(node, {
        paddingLeft: node.paddingX,
        paddingRight: node.paddingX
      });
    }
    if (_.has(node, 'paddingY')) {
      _.defaults(node, {
        paddingTop: node.paddingY,
        paddingBottom: node.paddingY
      });
    }
    if (_.has(node, 'padding')) {
      _.defaults(node, {
        paddingLeft: node.padding,
        paddingRight: node.padding,
        paddingTop: node.padding,
        paddingBottom: node.padding
      });
    }
    _.defaults(node, NODE_DEFAULT_ATTRS);
    _.each(['paddingLeft', 'paddingRight', 'paddingTop', 'paddingBottom'], function (k) {
      node[k] = Number(node[k]);
    });

    // Save dimensions for restore during post-processing
    if (_.has(node, 'width')) {
      node._prevWidth = node.width;
    }
    if (_.has(node, 'height')) {
      node._prevHeight = node.height;
    }
  });
  g.edges().forEach(function (e) {
    var edge = g.edge(e);
    if (!_.has(edge, 'label')) {
      edge.label = '';
    }
    _.defaults(edge, EDGE_DEFAULT_ATTRS);
  });
}
function postProcessGraph(g) {
  _.each(g.nodes(), function (v) {
    var node = g.node(v);

    // Restore original dimensions
    if (_.has(node, '_prevWidth')) {
      node.width = node._prevWidth;
    } else {
      delete node.width;
    }
    if (_.has(node, '_prevHeight')) {
      node.height = node._prevHeight;
    } else {
      delete node.height;
    }
    delete node._prevWidth;
    delete node._prevHeight;
  });
}
function createOrSelectGroup(root, name) {
  var selection = root.select('g.' + name);
  if (selection.empty()) {
    selection = root.append('g').attr('class', name);
  }
  return selection;
}
},{"d3":"node_modules/d3/src/index.js","lodash-es":"node_modules/lodash-es/lodash.js","../dagre/index.js":"node_modules/dagre-d3-es/src/dagre/index.js","./arrows.js":"node_modules/dagre-d3-es/src/dagre-js/arrows.js","./create-clusters.js":"node_modules/dagre-d3-es/src/dagre-js/create-clusters.js","./create-edge-labels.js":"node_modules/dagre-d3-es/src/dagre-js/create-edge-labels.js","./create-edge-paths.js":"node_modules/dagre-d3-es/src/dagre-js/create-edge-paths.js","./create-nodes.js":"node_modules/dagre-d3-es/src/dagre-js/create-nodes.js","./position-clusters.js":"node_modules/dagre-d3-es/src/dagre-js/position-clusters.js","./position-edge-labels.js":"node_modules/dagre-d3-es/src/dagre-js/position-edge-labels.js","./position-nodes.js":"node_modules/dagre-d3-es/src/dagre-js/position-nodes.js","./shapes.js":"node_modules/dagre-d3-es/src/dagre-js/shapes.js"}],"node_modules/dagre-d3-es/src/dagre-js/intersect/index.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.rect = exports.polygon = exports.node = exports.ellipse = exports.circle = void 0;
var node = _interopRequireWildcard(require("./intersect-node.js"));
exports.node = node;
var circle = _interopRequireWildcard(require("./intersect-circle.js"));
exports.circle = circle;
var ellipse = _interopRequireWildcard(require("./intersect-ellipse.js"));
exports.ellipse = ellipse;
var polygon = _interopRequireWildcard(require("./intersect-polygon.js"));
exports.polygon = polygon;
var rect = _interopRequireWildcard(require("./intersect-rect.js"));
exports.rect = rect;
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
},{"./intersect-node.js":"node_modules/dagre-d3-es/src/dagre-js/intersect/intersect-node.js","./intersect-circle.js":"node_modules/dagre-d3-es/src/dagre-js/intersect/intersect-circle.js","./intersect-ellipse.js":"node_modules/dagre-d3-es/src/dagre-js/intersect/intersect-ellipse.js","./intersect-polygon.js":"node_modules/dagre-d3-es/src/dagre-js/intersect/intersect-polygon.js","./intersect-rect.js":"node_modules/dagre-d3-es/src/dagre-js/intersect/intersect-rect.js"}],"node_modules/dagre-d3-es/src/index.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.intersect = exports.graphlib = void 0;
Object.defineProperty(exports, "render", {
  enumerable: true,
  get: function () {
    return _render.render;
  }
});
var _render = require("./dagre-js/render.js");
var graphlib = _interopRequireWildcard(require("./graphlib/index.js"));
exports.graphlib = graphlib;
var intersect = _interopRequireWildcard(require("./dagre-js/intersect/index.js"));
exports.intersect = intersect;
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
},{"./dagre-js/render.js":"node_modules/dagre-d3-es/src/dagre-js/render.js","./graphlib/index.js":"node_modules/dagre-d3-es/src/graphlib/index.js","./dagre-js/intersect/index.js":"node_modules/dagre-d3-es/src/dagre-js/intersect/index.js"}],"node_modules/mermaid/dist/flowDiagram-46a15f6f.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.diagram = void 0;
var _flowDb52e24d = require("./flowDb-52e24d17.js");
var graphlib = _interopRequireWildcard(require("dagre-d3-es/src/graphlib/index.js"));
var _d = require("d3");
var _commonDb573409be = require("./commonDb-573409be.js");
var _dagreD3Es = require("dagre-d3-es");
var _util = require("dagre-d3-es/src/dagre-js/util.js");
var _addHtmlLabel = require("dagre-d3-es/src/dagre-js/label/add-html-label.js");
var _utilsD622194a = require("./utils-d622194a.js");
var _intersectPolygon = require("dagre-d3-es/src/dagre-js/intersect/intersect-polygon.js");
var _intersectRect = require("dagre-d3-es/src/dagre-js/intersect/intersect-rect.js");
var _styles = require("./styles-26373982.js");
require("./mermaidAPI-3ae0f2f0.js");
require("stylis");
require("dompurify");
require("lodash-es/isEmpty.js");
require("dayjs");
require("khroma");
require("@braintree/sanitize-url");
require("lodash-es/memoize.js");
require("./index-5219d011.js");
require("dagre-d3-es/src/dagre/index.js");
require("dagre-d3-es/src/graphlib/json.js");
require("./edges-2e77835f.js");
require("./createText-1f5f8f92.js");
require("@khanacademy/simple-markdown");
require("./svgDraw-2526cba0.js");
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
function question(parent, bbox, node) {
  const w = bbox.width;
  const h = bbox.height;
  const s = (w + h) * 0.9;
  const points = [{
    x: s / 2,
    y: 0
  }, {
    x: s,
    y: -s / 2
  }, {
    x: s / 2,
    y: -s
  }, {
    x: 0,
    y: -s / 2
  }];
  const shapeSvg = insertPolygonShape(parent, s, s, points);
  node.intersect = function (point) {
    return (0, _intersectPolygon.intersectPolygon)(node, points, point);
  };
  return shapeSvg;
}
function hexagon(parent, bbox, node) {
  const f = 4;
  const h = bbox.height;
  const m = h / f;
  const w = bbox.width + 2 * m;
  const points = [{
    x: m,
    y: 0
  }, {
    x: w - m,
    y: 0
  }, {
    x: w,
    y: -h / 2
  }, {
    x: w - m,
    y: -h
  }, {
    x: m,
    y: -h
  }, {
    x: 0,
    y: -h / 2
  }];
  const shapeSvg = insertPolygonShape(parent, w, h, points);
  node.intersect = function (point) {
    return (0, _intersectPolygon.intersectPolygon)(node, points, point);
  };
  return shapeSvg;
}
function rect_left_inv_arrow(parent, bbox, node) {
  const w = bbox.width;
  const h = bbox.height;
  const points = [{
    x: -h / 2,
    y: 0
  }, {
    x: w,
    y: 0
  }, {
    x: w,
    y: -h
  }, {
    x: -h / 2,
    y: -h
  }, {
    x: 0,
    y: -h / 2
  }];
  const shapeSvg = insertPolygonShape(parent, w, h, points);
  node.intersect = function (point) {
    return (0, _intersectPolygon.intersectPolygon)(node, points, point);
  };
  return shapeSvg;
}
function lean_right(parent, bbox, node) {
  const w = bbox.width;
  const h = bbox.height;
  const points = [{
    x: -2 * h / 6,
    y: 0
  }, {
    x: w - h / 6,
    y: 0
  }, {
    x: w + 2 * h / 6,
    y: -h
  }, {
    x: h / 6,
    y: -h
  }];
  const shapeSvg = insertPolygonShape(parent, w, h, points);
  node.intersect = function (point) {
    return (0, _intersectPolygon.intersectPolygon)(node, points, point);
  };
  return shapeSvg;
}
function lean_left(parent, bbox, node) {
  const w = bbox.width;
  const h = bbox.height;
  const points = [{
    x: 2 * h / 6,
    y: 0
  }, {
    x: w + h / 6,
    y: 0
  }, {
    x: w - 2 * h / 6,
    y: -h
  }, {
    x: -h / 6,
    y: -h
  }];
  const shapeSvg = insertPolygonShape(parent, w, h, points);
  node.intersect = function (point) {
    return (0, _intersectPolygon.intersectPolygon)(node, points, point);
  };
  return shapeSvg;
}
function trapezoid(parent, bbox, node) {
  const w = bbox.width;
  const h = bbox.height;
  const points = [{
    x: -2 * h / 6,
    y: 0
  }, {
    x: w + 2 * h / 6,
    y: 0
  }, {
    x: w - h / 6,
    y: -h
  }, {
    x: h / 6,
    y: -h
  }];
  const shapeSvg = insertPolygonShape(parent, w, h, points);
  node.intersect = function (point) {
    return (0, _intersectPolygon.intersectPolygon)(node, points, point);
  };
  return shapeSvg;
}
function inv_trapezoid(parent, bbox, node) {
  const w = bbox.width;
  const h = bbox.height;
  const points = [{
    x: h / 6,
    y: 0
  }, {
    x: w - h / 6,
    y: 0
  }, {
    x: w + 2 * h / 6,
    y: -h
  }, {
    x: -2 * h / 6,
    y: -h
  }];
  const shapeSvg = insertPolygonShape(parent, w, h, points);
  node.intersect = function (point) {
    return (0, _intersectPolygon.intersectPolygon)(node, points, point);
  };
  return shapeSvg;
}
function rect_right_inv_arrow(parent, bbox, node) {
  const w = bbox.width;
  const h = bbox.height;
  const points = [{
    x: 0,
    y: 0
  }, {
    x: w + h / 2,
    y: 0
  }, {
    x: w,
    y: -h / 2
  }, {
    x: w + h / 2,
    y: -h
  }, {
    x: 0,
    y: -h
  }];
  const shapeSvg = insertPolygonShape(parent, w, h, points);
  node.intersect = function (point) {
    return (0, _intersectPolygon.intersectPolygon)(node, points, point);
  };
  return shapeSvg;
}
function stadium(parent, bbox, node) {
  const h = bbox.height;
  const w = bbox.width + h / 4;
  const shapeSvg = parent.insert("rect", ":first-child").attr("rx", h / 2).attr("ry", h / 2).attr("x", -w / 2).attr("y", -h / 2).attr("width", w).attr("height", h);
  node.intersect = function (point) {
    return (0, _intersectRect.intersectRect)(node, point);
  };
  return shapeSvg;
}
function subroutine(parent, bbox, node) {
  const w = bbox.width;
  const h = bbox.height;
  const points = [{
    x: 0,
    y: 0
  }, {
    x: w,
    y: 0
  }, {
    x: w,
    y: -h
  }, {
    x: 0,
    y: -h
  }, {
    x: 0,
    y: 0
  }, {
    x: -8,
    y: 0
  }, {
    x: w + 8,
    y: 0
  }, {
    x: w + 8,
    y: -h
  }, {
    x: -8,
    y: -h
  }, {
    x: -8,
    y: 0
  }];
  const shapeSvg = insertPolygonShape(parent, w, h, points);
  node.intersect = function (point) {
    return (0, _intersectPolygon.intersectPolygon)(node, points, point);
  };
  return shapeSvg;
}
function cylinder(parent, bbox, node) {
  const w = bbox.width;
  const rx = w / 2;
  const ry = rx / (2.5 + w / 50);
  const h = bbox.height + ry;
  const shape = "M 0," + ry + " a " + rx + "," + ry + " 0,0,0 " + w + " 0 a " + rx + "," + ry + " 0,0,0 " + -w + " 0 l 0," + h + " a " + rx + "," + ry + " 0,0,0 " + w + " 0 l 0," + -h;
  const shapeSvg = parent.attr("label-offset-y", ry).insert("path", ":first-child").attr("d", shape).attr("transform", "translate(" + -w / 2 + "," + -(h / 2 + ry) + ")");
  node.intersect = function (point) {
    const pos = (0, _intersectRect.intersectRect)(node, point);
    const x = pos.x - node.x;
    if (rx != 0 && (Math.abs(x) < node.width / 2 || Math.abs(x) == node.width / 2 && Math.abs(pos.y - node.y) > node.height / 2 - ry)) {
      let y = ry * ry * (1 - x * x / (rx * rx));
      if (y != 0) {
        y = Math.sqrt(y);
      }
      y = ry - y;
      if (point.y - node.y > 0) {
        y = -y;
      }
      pos.y += y;
    }
    return pos;
  };
  return shapeSvg;
}
function addToRender(render2) {
  render2.shapes().question = question;
  render2.shapes().hexagon = hexagon;
  render2.shapes().stadium = stadium;
  render2.shapes().subroutine = subroutine;
  render2.shapes().cylinder = cylinder;
  render2.shapes().rect_left_inv_arrow = rect_left_inv_arrow;
  render2.shapes().lean_right = lean_right;
  render2.shapes().lean_left = lean_left;
  render2.shapes().trapezoid = trapezoid;
  render2.shapes().inv_trapezoid = inv_trapezoid;
  render2.shapes().rect_right_inv_arrow = rect_right_inv_arrow;
}
function addToRenderV2(addShape) {
  addShape({
    question
  });
  addShape({
    hexagon
  });
  addShape({
    stadium
  });
  addShape({
    subroutine
  });
  addShape({
    cylinder
  });
  addShape({
    rect_left_inv_arrow
  });
  addShape({
    lean_right
  });
  addShape({
    lean_left
  });
  addShape({
    trapezoid
  });
  addShape({
    inv_trapezoid
  });
  addShape({
    rect_right_inv_arrow
  });
}
function insertPolygonShape(parent, w, h, points) {
  return parent.insert("polygon", ":first-child").attr("points", points.map(function (d) {
    return d.x + "," + d.y;
  }).join(" ")).attr("transform", "translate(" + -w / 2 + "," + h / 2 + ")");
}
const flowChartShapes = {
  addToRender,
  addToRenderV2
};
const conf = {};
const setConf = function (cnf) {
  const keys = Object.keys(cnf);
  for (const key of keys) {
    conf[key] = cnf[key];
  }
};
const addVertices = function (vert, g, svgId, root, _doc, diagObj) {
  const svg = !root ? (0, _d.select)(`[id="${svgId}"]`) : root.select(`[id="${svgId}"]`);
  const doc = !_doc ? document : _doc;
  const keys = Object.keys(vert);
  keys.forEach(function (id) {
    const vertex = vert[id];
    let classStr = "default";
    if (vertex.classes.length > 0) {
      classStr = vertex.classes.join(" ");
    }
    const styles = (0, _utilsD622194a.n)(vertex.styles);
    let vertexText = vertex.text !== void 0 ? vertex.text : vertex.id;
    let vertexNode;
    if ((0, _commonDb573409be.k)((0, _commonDb573409be.g)().flowchart.htmlLabels)) {
      const node = {
        label: vertexText.replace(/fa[blrs]?:fa-[\w-]+/g, s => `<i class='${s.replace(":", " ")}'></i>`)
      };
      vertexNode = (0, _addHtmlLabel.addHtmlLabel)(svg, node).node();
      vertexNode.parentNode.removeChild(vertexNode);
    } else {
      const svgLabel = doc.createElementNS("http://www.w3.org/2000/svg", "text");
      svgLabel.setAttribute("style", styles.labelStyle.replace("color:", "fill:"));
      const rows = vertexText.split(_commonDb573409be.e.lineBreakRegex);
      for (const row of rows) {
        const tspan = doc.createElementNS("http://www.w3.org/2000/svg", "tspan");
        tspan.setAttributeNS("http://www.w3.org/XML/1998/namespace", "xml:space", "preserve");
        tspan.setAttribute("dy", "1em");
        tspan.setAttribute("x", "1");
        tspan.textContent = row;
        svgLabel.appendChild(tspan);
      }
      vertexNode = svgLabel;
    }
    let radious = 0;
    let _shape = "";
    switch (vertex.type) {
      case "round":
        radious = 5;
        _shape = "rect";
        break;
      case "square":
        _shape = "rect";
        break;
      case "diamond":
        _shape = "question";
        break;
      case "hexagon":
        _shape = "hexagon";
        break;
      case "odd":
        _shape = "rect_left_inv_arrow";
        break;
      case "lean_right":
        _shape = "lean_right";
        break;
      case "lean_left":
        _shape = "lean_left";
        break;
      case "trapezoid":
        _shape = "trapezoid";
        break;
      case "inv_trapezoid":
        _shape = "inv_trapezoid";
        break;
      case "odd_right":
        _shape = "rect_left_inv_arrow";
        break;
      case "circle":
        _shape = "circle";
        break;
      case "ellipse":
        _shape = "ellipse";
        break;
      case "stadium":
        _shape = "stadium";
        break;
      case "subroutine":
        _shape = "subroutine";
        break;
      case "cylinder":
        _shape = "cylinder";
        break;
      case "group":
        _shape = "rect";
        break;
      default:
        _shape = "rect";
    }
    _commonDb573409be.l.warn("Adding node", vertex.id, vertex.domId);
    g.setNode(diagObj.db.lookUpDomId(vertex.id), {
      labelType: "svg",
      labelStyle: styles.labelStyle,
      shape: _shape,
      label: vertexNode,
      rx: radious,
      ry: radious,
      class: classStr,
      style: styles.style,
      id: diagObj.db.lookUpDomId(vertex.id)
    });
  });
};
const addEdges = function (edges, g, diagObj) {
  let cnt = 0;
  let defaultStyle;
  let defaultLabelStyle;
  if (edges.defaultStyle !== void 0) {
    const defaultStyles = (0, _utilsD622194a.n)(edges.defaultStyle);
    defaultStyle = defaultStyles.style;
    defaultLabelStyle = defaultStyles.labelStyle;
  }
  edges.forEach(function (edge) {
    cnt++;
    var linkId = "L-" + edge.start + "-" + edge.end;
    var linkNameStart = "LS-" + edge.start;
    var linkNameEnd = "LE-" + edge.end;
    const edgeData = {};
    if (edge.type === "arrow_open") {
      edgeData.arrowhead = "none";
    } else {
      edgeData.arrowhead = "normal";
    }
    let style = "";
    let labelStyle = "";
    if (edge.style !== void 0) {
      const styles = (0, _utilsD622194a.n)(edge.style);
      style = styles.style;
      labelStyle = styles.labelStyle;
    } else {
      switch (edge.stroke) {
        case "normal":
          style = "fill:none";
          if (defaultStyle !== void 0) {
            style = defaultStyle;
          }
          if (defaultLabelStyle !== void 0) {
            labelStyle = defaultLabelStyle;
          }
          break;
        case "dotted":
          style = "fill:none;stroke-width:2px;stroke-dasharray:3;";
          break;
        case "thick":
          style = " stroke-width: 3.5px;fill:none";
          break;
      }
    }
    edgeData.style = style;
    edgeData.labelStyle = labelStyle;
    if (edge.interpolate !== void 0) {
      edgeData.curve = (0, _utilsD622194a.o)(edge.interpolate, _d.curveLinear);
    } else if (edges.defaultInterpolate !== void 0) {
      edgeData.curve = (0, _utilsD622194a.o)(edges.defaultInterpolate, _d.curveLinear);
    } else {
      edgeData.curve = (0, _utilsD622194a.o)(conf.curve, _d.curveLinear);
    }
    if (edge.text === void 0) {
      if (edge.style !== void 0) {
        edgeData.arrowheadStyle = "fill: #333";
      }
    } else {
      edgeData.arrowheadStyle = "fill: #333";
      edgeData.labelpos = "c";
      if ((0, _commonDb573409be.k)((0, _commonDb573409be.g)().flowchart.htmlLabels)) {
        edgeData.labelType = "html";
        edgeData.label = `<span id="L-${linkId}" class="edgeLabel L-${linkNameStart}' L-${linkNameEnd}" style="${edgeData.labelStyle}">${edge.text.replace(/fa[blrs]?:fa-[\w-]+/g, s => `<i class='${s.replace(":", " ")}'></i>`)}</span>`;
      } else {
        edgeData.labelType = "text";
        edgeData.label = edge.text.replace(_commonDb573409be.e.lineBreakRegex, "\n");
        if (edge.style === void 0) {
          edgeData.style = edgeData.style || "stroke: #333; stroke-width: 1.5px;fill:none";
        }
        edgeData.labelStyle = edgeData.labelStyle.replace("color:", "fill:");
      }
    }
    edgeData.id = linkId;
    edgeData.class = linkNameStart + " " + linkNameEnd;
    edgeData.minlen = edge.length || 1;
    g.setEdge(diagObj.db.lookUpDomId(edge.start), diagObj.db.lookUpDomId(edge.end), edgeData, cnt);
  });
};
const getClasses = function (text, diagObj) {
  _commonDb573409be.l.info("Extracting classes");
  diagObj.db.clear();
  try {
    diagObj.parse(text);
    return diagObj.db.getClasses();
  } catch (e) {
    _commonDb573409be.l.error(e);
    return {};
  }
};
const draw = function (text, id, _version, diagObj) {
  _commonDb573409be.l.info("Drawing flowchart");
  diagObj.db.clear();
  const {
    securityLevel,
    flowchart: conf2
  } = (0, _commonDb573409be.g)();
  let sandboxElement;
  if (securityLevel === "sandbox") {
    sandboxElement = (0, _d.select)("#i" + id);
  }
  const root = securityLevel === "sandbox" ? (0, _d.select)(sandboxElement.nodes()[0].contentDocument.body) : (0, _d.select)("body");
  const doc = securityLevel === "sandbox" ? sandboxElement.nodes()[0].contentDocument : document;
  try {
    diagObj.parser.parse(text);
  } catch (err) {
    _commonDb573409be.l.debug("Parsing failed");
  }
  let dir = diagObj.db.getDirection();
  if (dir === void 0) {
    dir = "TD";
  }
  const nodeSpacing = conf2.nodeSpacing || 50;
  const rankSpacing = conf2.rankSpacing || 50;
  const g = new graphlib.Graph({
    multigraph: true,
    compound: true
  }).setGraph({
    rankdir: dir,
    nodesep: nodeSpacing,
    ranksep: rankSpacing,
    marginx: 8,
    marginy: 8
  }).setDefaultEdgeLabel(function () {
    return {};
  });
  let subG;
  const subGraphs = diagObj.db.getSubGraphs();
  for (let i2 = subGraphs.length - 1; i2 >= 0; i2--) {
    subG = subGraphs[i2];
    diagObj.db.addVertex(subG.id, subG.title, "group", void 0, subG.classes);
  }
  const vert = diagObj.db.getVertices();
  _commonDb573409be.l.warn("Get vertices", vert);
  const edges = diagObj.db.getEdges();
  let i = 0;
  for (i = subGraphs.length - 1; i >= 0; i--) {
    subG = subGraphs[i];
    (0, _d.selectAll)("cluster").append("text");
    for (let j = 0; j < subG.nodes.length; j++) {
      _commonDb573409be.l.warn("Setting subgraph", subG.nodes[j], diagObj.db.lookUpDomId(subG.nodes[j]), diagObj.db.lookUpDomId(subG.id));
      g.setParent(diagObj.db.lookUpDomId(subG.nodes[j]), diagObj.db.lookUpDomId(subG.id));
    }
  }
  addVertices(vert, g, id, root, doc, diagObj);
  addEdges(edges, g, diagObj);
  const render$1 = new _dagreD3Es.render();
  flowChartShapes.addToRender(render$1);
  render$1.arrows().none = function normal(parent, id2, edge, type) {
    const marker = parent.append("marker").attr("id", id2).attr("viewBox", "0 0 10 10").attr("refX", 9).attr("refY", 5).attr("markerUnits", "strokeWidth").attr("markerWidth", 8).attr("markerHeight", 6).attr("orient", "auto");
    const path = marker.append("path").attr("d", "M 0 0 L 0 0 L 0 0 z");
    (0, _util.applyStyle)(path, edge[type + "Style"]);
  };
  render$1.arrows().normal = function normal(parent, id2) {
    const marker = parent.append("marker").attr("id", id2).attr("viewBox", "0 0 10 10").attr("refX", 9).attr("refY", 5).attr("markerUnits", "strokeWidth").attr("markerWidth", 8).attr("markerHeight", 6).attr("orient", "auto");
    marker.append("path").attr("d", "M 0 0 L 10 5 L 0 10 z").attr("class", "arrowheadPath").style("stroke-width", 1).style("stroke-dasharray", "1,0");
  };
  const svg = root.select(`[id="${id}"]`);
  const element = root.select("#" + id + " g");
  render$1(element, g);
  element.selectAll("g.node").attr("title", function () {
    return diagObj.db.getTooltip(this.id);
  });
  diagObj.db.indexNodes("subGraph" + i);
  for (i = 0; i < subGraphs.length; i++) {
    subG = subGraphs[i];
    if (subG.title !== "undefined") {
      const clusterRects = doc.querySelectorAll("#" + id + ' [id="' + diagObj.db.lookUpDomId(subG.id) + '"] rect');
      const clusterEl = doc.querySelectorAll("#" + id + ' [id="' + diagObj.db.lookUpDomId(subG.id) + '"]');
      const xPos = clusterRects[0].x.baseVal.value;
      const yPos = clusterRects[0].y.baseVal.value;
      const _width = clusterRects[0].width.baseVal.value;
      const cluster = (0, _d.select)(clusterEl[0]);
      const te = cluster.select(".label");
      te.attr("transform", `translate(${xPos + _width / 2}, ${yPos + 14})`);
      te.attr("id", id + "Text");
      for (let j = 0; j < subG.classes.length; j++) {
        clusterEl[0].classList.add(subG.classes[j]);
      }
    }
  }
  if (!conf2.htmlLabels) {
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
  (0, _utilsD622194a.s)(g, svg, conf2.diagramPadding, conf2.useMaxWidth);
  const keys = Object.keys(vert);
  keys.forEach(function (key) {
    const vertex = vert[key];
    if (vertex.link) {
      const node = root.select("#" + id + ' [id="' + diagObj.db.lookUpDomId(key) + '"]');
      if (node) {
        const link = doc.createElementNS("http://www.w3.org/2000/svg", "a");
        link.setAttributeNS("http://www.w3.org/2000/svg", "class", vertex.classes.join(" "));
        link.setAttributeNS("http://www.w3.org/2000/svg", "href", vertex.link);
        link.setAttributeNS("http://www.w3.org/2000/svg", "rel", "noopener");
        if (securityLevel === "sandbox") {
          link.setAttributeNS("http://www.w3.org/2000/svg", "target", "_top");
        } else if (vertex.linkTarget) {
          link.setAttributeNS("http://www.w3.org/2000/svg", "target", vertex.linkTarget);
        }
        const linkNode = node.insert(function () {
          return link;
        }, ":first-child");
        const shape = node.select(".label-container");
        if (shape) {
          linkNode.append(function () {
            return shape.node();
          });
        }
        const label = node.select(".label");
        if (label) {
          linkNode.append(function () {
            return label.node();
          });
        }
      }
    }
  });
};
const flowRenderer = {
  setConf,
  addVertices,
  addEdges,
  getClasses,
  draw
};
const diagram = {
  parser: _flowDb52e24d.p,
  db: _flowDb52e24d.f,
  renderer: _styles.f,
  styles: _styles.a,
  init: cnf => {
    if (!cnf.flowchart) {
      cnf.flowchart = {};
    }
    cnf.flowchart.arrowMarkerAbsolute = cnf.arrowMarkerAbsolute;
    flowRenderer.setConf(cnf.flowchart);
    _flowDb52e24d.f.clear();
    _flowDb52e24d.f.setGen("gen-1");
  }
};
exports.diagram = diagram;
},{"./flowDb-52e24d17.js":"node_modules/mermaid/dist/flowDb-52e24d17.js","dagre-d3-es/src/graphlib/index.js":"node_modules/dagre-d3-es/src/graphlib/index.js","d3":"node_modules/d3/src/index.js","./commonDb-573409be.js":"node_modules/mermaid/dist/commonDb-573409be.js","dagre-d3-es":"node_modules/dagre-d3-es/src/index.js","dagre-d3-es/src/dagre-js/util.js":"node_modules/dagre-d3-es/src/dagre-js/util.js","dagre-d3-es/src/dagre-js/label/add-html-label.js":"node_modules/dagre-d3-es/src/dagre-js/label/add-html-label.js","./utils-d622194a.js":"node_modules/mermaid/dist/utils-d622194a.js","dagre-d3-es/src/dagre-js/intersect/intersect-polygon.js":"node_modules/dagre-d3-es/src/dagre-js/intersect/intersect-polygon.js","dagre-d3-es/src/dagre-js/intersect/intersect-rect.js":"node_modules/dagre-d3-es/src/dagre-js/intersect/intersect-rect.js","./styles-26373982.js":"node_modules/mermaid/dist/styles-26373982.js","./mermaidAPI-3ae0f2f0.js":"node_modules/mermaid/dist/mermaidAPI-3ae0f2f0.js","stylis":"node_modules/stylis/dist/stylis.mjs","dompurify":"node_modules/dompurify/dist/purify.js","lodash-es/isEmpty.js":"node_modules/lodash-es/isEmpty.js","dayjs":"node_modules/dayjs/dayjs.min.js","khroma":"node_modules/khroma/dist/index.js","@braintree/sanitize-url":"node_modules/@braintree/sanitize-url/dist/index.js","lodash-es/memoize.js":"node_modules/lodash-es/memoize.js","./index-5219d011.js":"node_modules/mermaid/dist/index-5219d011.js","dagre-d3-es/src/dagre/index.js":"node_modules/dagre-d3-es/src/dagre/index.js","dagre-d3-es/src/graphlib/json.js":"node_modules/dagre-d3-es/src/graphlib/json.js","./edges-2e77835f.js":"node_modules/mermaid/dist/edges-2e77835f.js","./createText-1f5f8f92.js":"node_modules/mermaid/dist/createText-1f5f8f92.js","@khanacademy/simple-markdown":"node_modules/@khanacademy/simple-markdown/dist/es/index.js","./svgDraw-2526cba0.js":"node_modules/mermaid/dist/svgDraw-2526cba0.js"}],"node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
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
//# sourceMappingURL=/flowDiagram-46a15f6f.f463b3de.js.map
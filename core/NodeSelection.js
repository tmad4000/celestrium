// Generated by CoffeeScript 1.6.3
(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define([], function() {
    var Selection;
    return Selection = (function(_super) {
      __extends(Selection, _super);

      function Selection(options) {
        this.options = options;
        Selection.__super__.constructor.call(this);
      }

      Selection.prototype.init = function(instances) {
        var _this = this;
        _.extend(this, Backbone.Events);
        this.keyListener = instances['KeyListener'];
        this.graphView = instances['GraphView'];
        this.linkFilter = this.graphView.getLinkFilter();
        this.graphModel = instances['GraphModel'];
        this.listenTo(this.keyListener, "down:17:65", this.selectAll);
        this.listenTo(this.keyListener, "down:27", this.deselectAll);
        this.listenTo(this.keyListener, "down:46", this.removeSelection);
        this.listenTo(this.keyListener, "down:13", this.removeSelectionCompliment);
        this.graphView.on("enter:node:click", function(datum) {
          _this.toggleSelection(datum);
          return _this.options.onClick(datum['text']);
        });
        return this.graphView.on("enter:node:dblclick", function(datum) {
          return _this.selectConnectedComponent(datum);
        });
      };

      Selection.prototype.renderSelection = function() {
        var nodeSelection;
        nodeSelection = this.graphView.getNodeSelection();
        if (nodeSelection) {
          return nodeSelection.call(function(selection) {
            return selection.classed("selected", function(d) {
              return d.selected;
            });
          });
        }
      };

      Selection.prototype.filterSelection = function(filter) {
        _.each(this.graphModel.getNodes(), function(node) {
          return node.selected = filter(node);
        });
        return this.renderSelection();
      };

      Selection.prototype.selectAll = function() {
        this.filterSelection(function(n) {
          return true;
        });
        return this.trigger("change");
      };

      Selection.prototype.deselectAll = function() {
        this.filterSelection(function(n) {
          return false;
        });
        return this.trigger("change");
      };

      Selection.prototype.toggleSelection = function(node) {
        node.selected = !node.selected;
        this.trigger("change");
        return this.renderSelection();
      };

      Selection.prototype.removeSelection = function() {
        return this.graphModel.filterNodes(function(node) {
          return !node.selected;
        });
      };

      Selection.prototype.removeSelectionCompliment = function() {
        return this.graphModel.filterNodes(function(node) {
          return node.selected;
        });
      };

      Selection.prototype.getSelectedNodes = function() {
        return _.filter(this.graphModel.getNodes(), function(node) {
          return node.selected;
        });
      };

      Selection.prototype.selectBoundedNodes = function(dim) {
        var intersect, selectRect;
        selectRect = {
          left: dim.x,
          right: dim.x + dim.width,
          top: dim.y,
          bottom: dim.y + dim.height
        };
        intersect = function(rect1, rect2) {
          return !(rect1.right < rect2.left || rect1.bottom < rect2.top || rect1.left > rect2.right || rect1.top > rect2.bottom);
        };
        this.graphView.getNodeSelection().each(function(datum, i) {
          var bcr;
          bcr = this.getBoundingClientRect();
          return datum.selected = intersect(selectRect, bcr);
        });
        this.trigger('change');
        return this.renderSelection();
      };

      Selection.prototype.selectConnectedComponent = function(node) {
        var allTrue, graph, lookup, newSelected, seen, visit;
        visit = function(text) {
          if (!_.has(seen, text)) {
            seen[text] = 1;
            return _.each(graph[text], function(ignore, neighborText) {
              return visit(neighborText);
            });
          }
        };
        graph = {};
        lookup = {};
        _.each(this.graphModel.getNodes(), function(node) {
          graph[node.text] = {};
          return lookup[node.text] = node;
        });
        _.each(this.linkFilter.filter(this.graphModel.getLinks()), function(link) {
          graph[link.source.text][link.target.text] = 1;
          return graph[link.target.text][link.source.text] = 1;
        });
        seen = {};
        visit(node.text);
        allTrue = true;
        _.each(seen, function(ignore, text) {
          return allTrue = allTrue && lookup[text].selected;
        });
        newSelected = !allTrue;
        _.each(seen, function(ignore, text) {
          return lookup[text].selected = newSelected;
        });
        this.trigger("change");
        return this.renderSelection();
      };

      return Selection;

    })(Backbone.View);
  });

}).call(this);

// Generated by CoffeeScript 1.6.3
(function() {
  define([], function() {
    var KeyListener;
    return KeyListener = (function() {
      function KeyListener(target) {
        var state, watch,
          _this = this;
        _.extend(this, Backbone.Events);
        state = {};
        watch = [17, 65, 27, 46, 13, 16, 80, 187, 191];
        $(window).keydown(function(e) {
          var eventName, keysDown;
          if (e.target !== target || !_.contains(watch, e.which)) {
            return;
          }
          state[e.which] = e;
          keysDown = _.chain(state).map(function(event, which) {
            return which;
          }).sortBy(function(which) {
            return which;
          }).value();
          eventName = "down:" + (keysDown.join(':'));
          _this.trigger(eventName, e);
          if (e.isDefaultPrevented()) {
            return delete state[e.which];
          }
        });
        $(window).keyup(function(e) {
          if (e.target !== target) {
            return;
          }
          return delete state[e.which];
        });
      }

      KeyListener.prototype.init = function() {};

      return KeyListener;

    })();
  });

}).call(this);

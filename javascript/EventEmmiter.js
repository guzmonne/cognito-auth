(function(win){
  var events = {};

  function on(event, listener) {
    if (typeof events[event] !== 'object') {
      events[event] = [];
    }
    events[event].push(listener);
  }

  function off(event, listener) {
    if (typeof events[event] === 'object') {
      var idx = events[event].indexOf(listener)
      if (idx > -1) {
        events[event].splice(idx, 1)
      }
    }
  }

  function emit() {
    var args = Array.prototype.slice.call(arguments);
    var event = args[0]
    if (typeof events[event] === 'object') {
      events[event].map(function (listener) {
        listener.apply(null, args.slice(1))
      })
    }
  }

  function once(event, listener) {
    function autoRemoveListener() {
      var args = Array.prototype.slice.call(arguments);
      off(event, autoRemoveListener)
      listener.apply(null, args)
    }
    on(event, autoRemoveListener)
  }

  win.EventEmitter = Object.freeze({
    on: on,
    off: off,
    emit: emit,
    once: once,
    events: events,
  })
})(window)

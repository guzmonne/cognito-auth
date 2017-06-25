(function(ready, EventEmitter) {

  ready(function() {
    EventEmitter.emit('LoginForm:mount')
  })

})(window.ready, window.EventEmitter)

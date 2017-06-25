(function(EventEmitter, tmpl, Cognito) {
  var $root = document.getElementById('root'),
    $container = document.createElement('div'),
    $loading,
    $title,
    $alert,
    $button;

  function addClass(element, className) {
    if (element.classList) {
      element.classList.add(className);
    } else {
      element.className += ' ' + className;
    }
  }

  function prepend(element, parent) {
    parent.insertBefore(element, parent.firstChild);
  }

  function addAlert(options) {
    $alert = document.createElement('div');
    $alert.innerHTML = tmpl('Alert', options);
    prepend($alert, $container);
    $close = $root.getElementsByClassName('Alert__close')[0];
    $close.addEventListener('click', removeAlert);
  }

  function removeAlert() {
    $close && $close.removeEventListener('click', removeAlert);
    $alert && $alert.remove();
  }

  function redirectToLoginPage(message) {
    EventEmitter.emit('LoginForm:mount', message);
    EventEmitter.emit('Welcome:unmount');
  }

  function handleSignOut(event) {
    event.preventDefault();
    Cognito.signOut()
    .then(function() {
      addAlert({
        type: 'success',
        message: 'Logging out. Please wait...'
      })
      setTimeout(function() {
        EventEmitter.emit('Welcome:unmount');
        EventEmitter.emit('LoginForm:mount');
      }, 3000)
    })
    .catch(function(error) {
      addAlert({
        type: 'error',
        message: error.message,
      })
      console.error(error);
    })
  }

  function render(user) {
    $container.innerHTML = tmpl('Welcome', user);
    $button = $container.getElementsByTagName('button')[0];
    $button.addEventListener('click', handleSignOut);
  }

  function loading() {
    $loading = document.createElement('div'),
    $title = document.createElement('h2'),
    addClass($loading, 'Well');
    addClass($loading, 'Well__loading');
    $title.textContent = 'Please wait';
    $loading.appendChild($title);
    $container.innerHTML = $loading.outerHTML;
  }


  EventEmitter.on('Welcome:mount', function() {
    Cognito.isAuthenticated()
    .then(function() {
      $root.appendChild($container);
      loading();
      Cognito.getUser()
      .then(function(user) {
        setTimeout(function(){render(user)}, 1000);
        console.log(user);
      })
    })
    .catch(function(error) {
      redirectToLoginPage({
        type: 'error',
        message: error.message,
      })
    })
  })

  EventEmitter.on('Welcome:unmount', function() {
    $button.removeEventListener('click', handleSignOut);
    $container.remove();
  })

})(window.EventEmitter, window.tmpl, window.Cognito)

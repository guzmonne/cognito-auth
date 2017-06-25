(function(EventEmitter, tmpl, Cognito) {

  var $root = document.getElementById('root'), 
    $container = document.createElement('div'),
    $button,
    $link,
    $title,
    $close,
    $form;

  function startLoading() {
    removeAlert()
    $button = $container.querySelectorAll('input[type=submit]')[0];
    $button.disabled = true;
    $button.value = 'Loading...';
  }

  function stopLoading() {
    $button.disabled = false;
    $button.value = 'Sign me up!'
  }

  function addAlert(options) {
    $title.insertAdjacentHTML('afterend', tmpl('Alert', options));
    $close = $container.getElementsByClassName('Alert__close')[0];
    $close.addEventListener('click', handleClose);
  }

  function removeAlert() {
    $alert = $container.getElementsByClassName('Alert')[0];
    $alert && $alert.remove();
    $close && $close.removeEventListener('click', handleClose);
  }

  function handleClose(event) {
    event.target.parentNode.remove()
  }

  function handleLoginLink(event) {
    event.preventDefault();
    EventEmitter.emit('SignupForm:unmount');
    EventEmitter.emit('LoginForm:mount');
  }

  function handleSubmit(event) {
    var $inputs = $container.getElementsByTagName('input'),
      attributes;
    event.preventDefault()
    if ($inputs.password.value !== $inputs.repeatPassword.value) {
      console.log('Passwords do not match!')
      return;
    }
    startLoading()
    Cognito.signUp($inputs.email.value, $inputs.password.value)
    .then(function(result) {
      stopLoading()
      addAlert({
        type: 'success',
        message: 'Usuario creado correctamente.',
      })
      console.log(result)
    })
    .catch(function(error) {
      stopLoading()
      addAlert({
        type: 'error',
        message: error.message,
      })
      console.error(error)
    })
  }

  EventEmitter.on('SignupForm:mount', function() {
    Cognito.isNotAuthenticated()
    .then(function() {
      $container.innerHTML = tmpl('SignupForm', {})
      $link = $container.getElementsByClassName('Control__link')[0]
      $form = $container.getElementsByTagName('form')[0]
      $title = $container.getElementsByClassName('title')[0]
      $link.addEventListener('click', handleLoginLink)
      $form.addEventListener('submit', handleSubmit)
      $root.appendChild($container)
    })
    .catch(function() {
      EventEmitter.emit('SignupForm:unmount');
      EventEmitter.emit('Welcome:mount');
    })
  })

  EventEmitter.on('SignupForm:unmount', function() {
    $link.removeEventListener('click', handleLoginLink)
    $form.removeEventListener('submit', handleSubmit)
    $container.remove()
  })

})(
  window.EventEmitter,
  window.tmpl,
  window.Cognito
)

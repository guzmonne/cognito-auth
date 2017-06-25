(function(EventEmitter, tmpl, Cognito) {
  var email,
    $root = document.getElementById('root'),
    $container = document.createElement('div'),
    $alert,
    $button,
    $link,
    $form,
    $title,
    $close;

  function handleClose(event) {
    event.target.parentNode.remove()
  }

  function startLoading() {
    removeAlert();
    $button = $container.querySelectorAll('input[type=submit]')[0];
    $button.disabled = true;
    $button.value = 'Loading...';
  }

  function stopLoading() {
    $button.disabled = false;
    $button.value = 'Here you go.'
  }

  function addAlert(options) {
    removeAlert();
    $title.insertAdjacentHTML('afterend', tmpl('Alert', options));
    $close = $container.getElementsByClassName('Alert__close')[0];
    $close.addEventListener('click', handleClose);
  }

  function removeAlert() {
    $alert = $container.getElementsByClassName('Alert')[0];
    $alert && $alert.remove();
    $close && $close.removeEventListener('click', handleClose);
  }

  function handelResendCode(event) {
    event.preventDefault();
    Cognito.resendConfirmationCode()
    .then(function(result) {
      addAlert({
        type: 'info',
        message: 'A new confirmation code was sent.'
      });
      console.log(result);
    })
    .catch(function(error) {
      addAlert({
        type: 'error',
        message: error.message,
      });
      console.error(error);
    })
  }

  function handleLoginLink(event) {
    event.preventDefault();
    redirectToLogin()
  }

  function redirectToLogin(message) {
    EventEmitter.emit('ConfirmForm:unmount');
    EventEmitter.emit('LoginForm:mount', message);
  }

  function handleSubmit(event) {
    event.preventDefault();
    var $inputs = $container.getElementsByTagName('input');
    startLoading();
    Cognito.confirm(email, $inputs.code.value)
    .then(function(result) {
      //stopLoading();
      addAlert({
        type: 'success',
        message: 'Email confirmation done. Redirecting',
      })
      setTimeout(function(){
        redirectToLogin({
          type: 'info',
          message: 'Please re-enter your credentials.'
        })
      }, 3000);
      console.log(result);
    })
    .catch(function(error) {
      stopLoading();
      addAlert({
        type: 'error',
        message: error.message,
      });
      console.log(error);
    })
  }

  EventEmitter.on('ConfirmForm:mount', function(options) {
    Cognito.isNotAuthenticated()
    .then(function() {
      email = options.email;
      $container.innerHTML = tmpl('ConfirmForm', {})
      $resend = $container.getElementsByClassName('Control__link')[0]
      $link = $container.getElementsByClassName('Control__link')[1];
      $form = $container.getElementsByClassName('form')[0];
      $title = $container.getElementsByClassName('title')[0];
      addAlert({
        type: 'warning',
        message: 'You must confirm your email address.',
      })
      $resend.addEventListener('click', handelResendCode);
      $link.addEventListener('click', handleLoginLink);
      $form.addEventListener('submit', handleSubmit);
      $root.appendChild($container);
    })
    .catch(function() {
      EventEmitter.emit('ConfirmForm:unmount');
      EventEmitter.emit('Welcome:mount');
    })
  })

  EventEmitter.on('ConfirmForm:unmount', function() {
    $resend.removeEventListener('click', handelResendCode);
    $link.removeEventListener('click', handleLoginLink);
    $form.removeEventListener('submit', handleSubmit);
    $container.remove();
  })

})(window.EventEmitter, window.tmpl, window.Cognito)

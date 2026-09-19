(function () {
  const auth = window.LAMBDA_SUPABASE?.client.auth;
  const $ = (id) => document.getElementById(id);
  const validEmail = (email) => /^[^\s@]+@itba\.edu\.ar$/i.test(email);
  const callback = new URL('login.html', location.href).href;
  const recoveryLink = new URLSearchParams(location.search).get('mode') === 'update';
  let mode = recoveryLink ? 'update' : 'login';
  let busy = false;
  let recoveryReady = false;
  const titles = { login: ['Qué bueno verte de nuevo.', 'Entrá con tu correo del ITBA.', 'Iniciar sesión'], signup: ['Tu próximo examen empieza acá.', 'Creá tu cuenta con tu correo @itba.edu.ar.', 'Crear cuenta'], reset: ['Recuperá tu cuenta.', 'Te enviaremos un enlace a tu correo del ITBA.', 'Enviar enlace'], update: ['Una nueva contraseña.', 'Elegí una contraseña para volver a tu biblioteca.', 'Guardar contraseña'] };
  function message(text, error = false) {
    $('auth-message').textContent = text;
    $('auth-message').dataset.error = error;
    $('auth-message').hidden = !text;
  }
  function setMode(next) {
    mode = next;
    const [title, description, action] = titles[mode];
    $('auth-title').textContent = title;
    $('auth-description').textContent = description;
    $('auth-submit').innerHTML = `${action} <i data-lucide="arrow-right"></i>`;
    document.title = `${action} | Lambda`;
    document.querySelector('.auth-tabs').hidden = ['reset', 'update'].includes(mode);
    document.querySelectorAll('[data-mode]').forEach((button) => button.setAttribute('aria-pressed', button.dataset.mode === mode));
    $('email-field').hidden = mode === 'update';
    $('email').disabled = mode === 'update';
    $('password-field').hidden = mode === 'reset';
    $('password').disabled = mode === 'reset';
    $('password').minLength = ['signup', 'update'].includes(mode) ? 8 : 1;
    $('password').autocomplete = mode === 'login' ? 'current-password' : 'new-password';
    $('password').value = '';
    $('confirm-password').value = '';
    $('confirm-field').hidden = !['signup', 'update'].includes(mode);
    $('confirm-password').disabled = $('confirm-field').hidden;
    $('confirm-password').required = !$('confirm-field').hidden;
    $('password-hint').hidden = !['signup', 'update'].includes(mode);
    $('forgot-password').hidden = mode !== 'login';
    $('back-login').hidden = !['reset', 'update'].includes(mode);
    $('resend').hidden = true;
    message('');
    window.lucide?.createIcons();
  }
  function errorMessage(error) {
    const code = error?.code;
    const detail = String(error?.message || '');
    if (code === 'invalid_credentials') return 'El correo o la contraseña no coinciden.';
    if (code === 'email_not_confirmed') { $('resend').hidden = false; return 'Confirmá tu correo antes de ingresar. Revisá también la carpeta de spam.'; }
    if (code === 'over_email_send_rate_limit' || code === 'over_request_rate_limit') return 'Hubo demasiados intentos. Esperá unos minutos y probá de nuevo.';
    if (code === 'email_address_not_authorized') return 'El envío de correos todavía no está habilitado para tu dirección. Contactá al equipo de Lambda.';
    if (code === 'weak_password') return 'Elegí una contraseña más segura, de al menos 8 caracteres.';
    if (code === 'same_password') return 'Elegí una contraseña diferente a la anterior.';
    if (code === 'user_already_exists') return 'Ya existe una cuenta con ese correo. Probá iniciar sesión.';
    if (/error sending (confirmation|recovery|magic link|email change|invite) email/i.test(detail)) return 'No pudimos enviar el correo. El equipo de Lambda necesita revisar la configuración del servicio de correo.';
    if (code === 'signup_disabled' || code === 'email_provider_disabled') return 'El registro por correo no está habilitado en este momento. Contactá al equipo de Lambda.';
    if (code?.startsWith('hook_') || /database error saving new user/i.test(detail)) return 'No pudimos completar el registro por un problema del servicio de cuentas. Contactá al equipo de Lambda.';
    if (code === 'request_timeout' || error?.name === 'AuthRetryableFetchError' && !error.status || error instanceof TypeError && /fetch|network/i.test(detail)) return 'No pudimos conectar con el servicio. Revisá tu conexión e intentá de nuevo.';
    return 'El servicio de cuentas no pudo completar la solicitud. Intentá más tarde o contactá al equipo de Lambda.';
  }
  function reportError(error) {
    // Record diagnostic identifiers only; never log credentials or server messages.
    console.warn('Lambda Auth:', {
      code: /^[a-z_]{1,80}$/.test(error?.code || '') ? error.code : 'unknown',
      status: Number.isInteger(error?.status) ? error.status : null
    });
    message(errorMessage(error), true);
  }
  async function enter(user) {
    if (!validEmail(user?.email || '') || !user?.email_confirmed_at) {
      await auth.signOut({ scope: 'local' });
      message('Necesitás un correo @itba.edu.ar confirmado para ingresar.', true);
      return;
    }
    location.replace(new URL('index.html', location.href).href);
  }
  async function run(action) {
    if (busy || !auth) return;
    busy = true;
    const controls = [...document.querySelectorAll('button')];
    controls.forEach((button) => { button.disabled = true; });
    $('auth-form').setAttribute('aria-busy', 'true');
    message('Un momento…');
    try { await action(); } catch (error) { reportError(error); }
    finally { busy = false; controls.forEach((button) => { button.disabled = false; }); $('auth-form').removeAttribute('aria-busy'); }
  }
  document.querySelectorAll('[data-mode]').forEach((button) => button.addEventListener('click', () => setMode(button.dataset.mode)));
  $('forgot-password').addEventListener('click', () => setMode('reset'));
  $('back-login').addEventListener('click', () => { location.replace(callback); });
  $('toggle-password').addEventListener('click', () => {
    const show = $('password').type === 'password';
    $('password').type = show ? 'text' : 'password';
    $('toggle-password').setAttribute('aria-pressed', show);
    $('toggle-password').setAttribute('aria-label', show ? 'Ocultar contraseña' : 'Mostrar contraseña');
    $('toggle-password').title = show ? 'Ocultar contraseña' : 'Mostrar contraseña';
    $('toggle-password').innerHTML = `<i data-lucide="${show ? 'eye-off' : 'eye'}"></i>`;
    window.lucide?.createIcons();
  });
  $('email').addEventListener('input', () => $('email').setCustomValidity(''));
  function emailValue() {
    const email = $('email').value.trim().toLowerCase();
    if (!validEmail(email)) { $('email').setCustomValidity('Usá tu correo @itba.edu.ar.'); $('email').reportValidity(); return null; }
    return email;
  }
  $('auth-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const email = mode === 'update' ? null : emailValue();
    if (mode !== 'update' && !email) return;
    const password = $('password').value;
    if (['signup', 'update'].includes(mode) && password !== $('confirm-password').value) { message('Las contraseñas no coinciden.', true); return; }
    run(async () => {
      if (mode === 'update') {
        if (!recoveryReady) { message('Abrí el enlace de recuperación que recibiste por correo.', true); return; }
        const { error } = await auth.updateUser({ password });
        if (error) throw error;
        await auth.signOut({ scope: 'local' });
        history.replaceState(null, '', callback);
        recoveryReady = false;
        setMode('login'); message('Contraseña actualizada. Ya podés iniciar sesión.');
      } else if (mode === 'reset') {
        const { error } = await auth.resetPasswordForEmail(email, { redirectTo: `${callback}?mode=update` });
        if (error) throw error;
        message('Si existe una cuenta con ese correo, recibirás un enlace para recuperar tu contraseña.');
      } else if (mode === 'signup') {
        const { data, error } = await auth.signUp({ email, password, options: { emailRedirectTo: callback } });
        if (error) throw error;
        if (data.session) { await enter(data.user); return; }
        message('Revisá tu correo para confirmar la cuenta. Si ya tenías una, podés iniciar sesión o recuperar tu contraseña.');
        $('resend').hidden = false;
        $('password').value = ''; $('confirm-password').value = '';
      } else {
        const { data, error } = await auth.signInWithPassword({ email, password });
        if (error) throw error;
        await enter(data.user);
      }
    });
  });
  $('resend').addEventListener('click', () => {
    const email = emailValue(); if (!email) return;
    run(async () => {
      const { error } = await auth.resend({ type: 'signup', email, options: { emailRedirectTo: callback } });
      if (error) throw error;
      message('Si tu cuenta está pendiente de confirmación, recibirás un nuevo correo.');
    });
  });
  setMode(mode);
  if (!auth) { message('No pudimos conectar con el servicio de acceso. Recargá la página para volver a intentar.', true); $('auth-submit').disabled = true; return; }
  const hash = new URLSearchParams(location.hash.slice(1));
  if (hash.has('error')) { history.replaceState(null, '', location.pathname + location.search); message('El enlace venció o ya fue utilizado. Solicitá uno nuevo.', true); }
  auth.onAuthStateChange((event) => {
    if (event === 'PASSWORD_RECOVERY') { recoveryReady = true; setMode('update'); }
  });
  (async () => {
    try {
      const { data: { session }, error } = await auth.getSession();
      if (error) throw error;
      if (!session) { if (recoveryLink) message('Abrí un enlace de recuperación válido desde tu correo.', true); return; }
      const { data: { user }, error: userError } = await auth.getUser();
      if (userError) throw userError;
      if (mode === 'update') { recoveryReady = validEmail(user?.email || '') && Boolean(user.email_confirmed_at); return; }
      await enter(user);
    } catch (error) { reportError(error); }
  })();
})();

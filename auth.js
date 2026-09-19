(function () {
  const auth = window.LAMBDA_SUPABASE?.client.auth;
  const config = window.LAMBDA_SUPABASE_CONFIG;
  const button = document.getElementById('google-login');
  const status = document.getElementById('auth-message');
  const callback = new URL('login.html', location.href).href;
  const validUser = (user) => /^[^\s@]+@itba\.edu\.ar$/i.test(user?.email || '') && Boolean(user?.email_confirmed_at);
  let busy = false;

  function message(text, error = false) {
    status.textContent = text; status.dataset.error = error; status.hidden = !text;
  }
  function report(error) {
    const code = error?.code;
    console.warn('Lambda Auth:', {
      code: /^[a-z_]{1,80}$/.test(code || '') ? code : 'unknown',
      status: Number.isInteger(error?.status) ? error.status : null
    });
    if (code === 'provider_disabled') message('El acceso con Google todavía no está habilitado. Probá más tarde.', true);
    else message('No pudimos completar el acceso. Volvé a intentar o contactá al equipo de Lambda.', true);
  }
  async function enter(user) {
    if (!validUser(user)) {
      const { error } = await auth.signOut({ scope: 'local' });
      if (error) throw error;
      message('Elegí tu cuenta @itba.edu.ar para ingresar a Lambda.', true);
      return;
    }
    location.replace(new URL('index.html', location.href).href);
  }

  button.addEventListener('click', async () => {
    if (!auth || busy) return;
    busy = true; button.disabled = true; button.setAttribute('aria-busy', 'true');
    message('Conectando con Google…');
    try {
      // Check availability before navigating so setup failures stay on this page.
      const response = await fetch(config.url + '/auth/v1/settings', { headers: { apikey: config.anonKey } });
      if (!response.ok) throw new Error('Auth settings unavailable');
      const settings = await response.json();
      if (!settings.external?.google) throw { code: 'provider_disabled' };
      const { data, error } = await auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: callback,
          skipBrowserRedirect: true,
          // hd is an account-picker hint, not an authorization boundary.
          queryParams: { hd: 'itba.edu.ar', prompt: 'select_account' }
        }
      });
      if (error) throw error;
      const target = new URL(data.url);
      if (target.origin !== new URL(config.url).origin || target.pathname !== '/auth/v1/authorize') throw new Error('Unexpected OAuth URL');
      location.assign(target.href);
    } catch (error) { report(error); busy = false; button.disabled = false; button.removeAttribute('aria-busy'); }
  });

  if (!auth) { message('No pudimos conectar con el servicio de acceso. Recargá la página para volver a intentar.', true); return; }
  const hash = new URLSearchParams(location.hash.slice(1));
  const query = new URLSearchParams(location.search);
  const callbackError = hash.has('error') || query.has('error');
  if (callbackError) {
    history.replaceState(null, '', location.pathname);
    message('No se completó el acceso. Volvé a intentar con tu cuenta @itba.edu.ar. Si la universidad bloquea el acceso, consultá con soporte del ITBA.', true);
  }
  (async () => {
    try {
      if (callbackError) return;
      const { data: { session }, error } = await auth.getSession();
      if (error) throw error;
      if (!session) return;
      const { data: { user }, error: userError } = await auth.getUser();
      if (userError) throw userError;
      await enter(user);
    } catch (error) { report(error); }
    finally { button.disabled = false; }
  })();
})();

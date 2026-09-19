window.LAMBDA_AUTH_READY = (async function () {
  const auth = window.LAMBDA_SUPABASE?.client.auth;
  const login = () => location.replace(new URL('login.html', location.href).href);
  if (!auth) { login(); return null; }
  try {
    const { data: { user }, error } = await auth.getUser();
    if (error || !user?.email_confirmed_at || !/^[^\s@]+@itba\.edu\.ar$/i.test(user.email || '')) { login(); return null; }
    auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || (event === 'TOKEN_REFRESHED' && !session)) login();
      if (session?.user && session.user.id !== user.id) location.reload();
      if (event === 'USER_UPDATED' && !/^[^\s@]+@itba\.edu\.ar$/i.test(session?.user?.email || '')) login();
    });
    document.getElementById('logout')?.addEventListener('click', async (event) => {
      const button = event.currentTarget; button.disabled = true;
      try {
        const { error } = await auth.signOut({ scope: 'local' });
        if (error) throw error;
        login();
      } catch { button.disabled = false; const status = document.getElementById('toast'); status.textContent = 'No pudimos cerrar la sesión. Intentá de nuevo.'; status.hidden = false; }
    });
    return user;
  } catch { login(); return null; }
})();

window.LAMBDA_ADMIN_READY = (async function () {
  const user = await window.LAMBDA_AUTH_READY;
  if (!user) return { allowed: false, user: null };
  try {
    const { data, error } = await window.LAMBDA_SUPABASE.client.rpc('is_library_admin');
    if (error) return { allowed: false, user, unavailable: true };
    const allowed = data === true;
    document.querySelectorAll('[data-admin-link]').forEach((link) => { link.hidden = !allowed; });
    return { allowed, user };
  } catch { return { allowed: false, user, unavailable: true }; }
})();

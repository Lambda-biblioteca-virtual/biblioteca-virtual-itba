(function () {
  const config = window.LAMBDA_SUPABASE_CONFIG;
  const factory = window.supabase?.createClient;

  if (!config?.url || !config?.anonKey || !factory) {
    window.LAMBDA_SUPABASE = null;
    return;
  }

  const client = factory(config.url, config.anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  });

  function mapMaterial(row) {
    return {
      id: row.id,
      careerId: row.career_id,
      year: Number(row.year),
      term: Number(row.term),
      subject: row.subject,
      type: row.type,
      title: row.title,
      url: row.file_url,
      status: row.status || "Abrir material",
      cover: row.cover_url || ""
    };
  }

  async function loadMaterials() {
    const { data, error } = await client
      .from("materials")
      .select("id, career_id, year, term, subject, type, title, file_url, status, cover_url")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return Array.isArray(data) ? data.map(mapMaterial) : [];
  }

  window.LAMBDA_SUPABASE = { client, loadMaterials };
})();

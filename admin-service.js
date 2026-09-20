(function () {
  const client = window.LAMBDA_SUPABASE?.client;
  const bucket = 'library-materials';
  const maxBytes = 50 * 1024 * 1024;
  const formats = {
    pdf: 'application/pdf', doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ppt: 'application/vnd.ms-powerpoint', pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    xls: 'application/vnd.ms-excel', xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    txt: 'text/plain', zip: 'application/zip', jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp'
  };
  const slug = (value) => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9.-]+/g, '-').replace(/^[.-]+|[.-]+$/g, '').slice(0,100) || 'archivo';
  function validateFile(file) {
    const ext = file.name.split('.').pop().toLowerCase();
    if (!formats[ext]) return 'Formato no admitido.';
    if (!file.size) return 'El archivo está vacío.';
    if (file.size > maxBytes) return 'Supera el límite de 50 MB.';
    return '';
  }
  function prepare(item, user) {
    const c = item.classification;
    const ext = item.file.name.split('.').pop().toLowerCase();
    const filename = slug(item.file.name.slice(0, -(ext.length + 1))) + '.' + ext;
    const path = `${user.id}/${c.career}/${c.year}/${c.term}/${slug(c.subject)}/${item.id}-${filename}`;
    const { data } = client.storage.from(bucket).getPublicUrl(path);
    item.record = {
      id: item.id, career_id: c.career, year: Number(c.year), term: Number(c.term), subject: c.subject,
      type: c.type, title: item.title.trim(), file_url: data.publicUrl, status: 'Abrir material',
      storage_path: path, original_name: item.file.name, file_size: item.file.size, uploaded_by: user.id
    };
  }
  async function existingRecord(item) {
    const { data, error } = await client.from('materials').select('id, storage_path, file_url').eq('id', item.id).maybeSingle();
    if (error) throw error;
    if (data && data.storage_path !== item.record.storage_path) throw new Error('Conflicto de publicación. Contactá al equipo de Lambda.');
    return data;
  }
  async function publish(item, user, onStage) {
    if (!item.record) prepare(item, user);
    // The same ID and immutable record make retries safe after an uncertain response.
    if (await existingRecord(item)) return;
    if (!item.stored) {
      onStage('Subiendo archivo…');
      const ext = item.file.name.split('.').pop().toLowerCase();
      const { error } = await client.storage.from(bucket).upload(item.record.storage_path, item.file, {
        contentType: formats[ext], cacheControl: '3600', upsert: false
      });
      if (error) {
        // A lost upload response may leave the object stored. Never overwrite it.
        const path = item.record.storage_path;
        const split = path.lastIndexOf('/');
        const name = path.slice(split + 1);
        const result = await client.storage.from(bucket).list(path.slice(0, split), { search: name, limit: 10 });
        const found = result.data?.find((file) => file.name === name && Number(file.metadata?.size) === item.file.size);
        if (result.error || !found) throw error;
      }
      item.stored = true;
    }
    onStage('Publicando en la biblioteca…');
    const { error } = await client.from('materials').insert(item.record);
    if (error && !(await existingRecord(item))) throw error;
  }
  window.LAMBDA_UPLOAD = { validateFile, publish, maxBytes };
})();

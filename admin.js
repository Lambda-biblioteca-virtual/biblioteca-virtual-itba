(async function () {
  const $ = (id) => document.getElementById(id);
  const client = window.LAMBDA_SUPABASE?.client;
  const careers = window.BIBLIOTECA_DATA.careers;
  const service = window.LAMBDA_UPLOAD;
  const types = [['Resumen','Resúmenes'],['Parcial','Parciales'],['Bibliografia','Bibliografía'],['Guia','Guías'],['TP','Trabajos prácticos']];
  const escape = (value) => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const icons = () => window.lucide?.createIcons();
  const blank = () => ({career:'',year:'',term:'',subject:'',type:''});
  let batch = blank(), queue = [], publishing = false, authorized = false;
  icons();
  const access = await window.LAMBDA_ADMIN_READY;
  if (!access?.user) return;
  if (!access.allowed) {
    $('access-status').textContent = access.unavailable
      ? 'No pudimos verificar los permisos. Si el panel todavía no fue activado, completá su configuración en Supabase.'
      : 'Esta sección está disponible únicamente para administradores.';
    return;
  }
  authorized = true;
  $('access-status').hidden = true;
  $('upload-panel').hidden = false;

  function message(text) { $('upload-message').textContent = text; $('upload-message').hidden = !text; }
  function options(values, selected) {
    return '<option value="">Seleccionar</option>' + values.map(([value,label]) => '<option value="'+escape(value)+'"'+(String(value)===String(selected)?' selected':'')+'>'+escape(label)+'</option>').join('');
  }
  function fields(c, key, disabled = false) {
    const career = careers.find(item=>item.id===c.career);
    const year = career?.years.find(item=>String(item.year)===c.year);
    const term = year?.terms.find(item=>String(item.term)===c.term);
    const sets = [
      ['career','Carrera',careers.map(item=>[item.id,item.name]),true],
      ['year','Año',(career?.years||[]).map(item=>[item.year,item.year+'° año']),Boolean(career)],
      ['term','Cuatrimestre',(year?.terms||[]).map(item=>[item.term,item.term+'° cuatrimestre']),Boolean(year)],
      ['subject','Materia',(term?.subjects||[]).map(item=>[item,item]),Boolean(term)],
      ['type','Tipo',types,true]
    ];
    return sets.map(([field,label,values,enabled])=>'<label for="'+key+'-'+field+'">'+label+'<select id="'+key+'-'+field+'" data-field="'+field+'" '+(disabled||!enabled?'disabled':'')+' required>'+options(values,c[field])+'</select></label>').join('');
  }
  function valid(c) {
    const career = careers.find(item=>item.id===c.career);
    return Boolean(career?.years.find(item=>String(item.year)===c.year)?.terms.find(item=>String(item.term)===c.term)?.subjects.includes(c.subject) && types.some(([type])=>type===c.type));
  }
  function change(c, field, value) {
    c[field] = value;
    if (field==='career') { c.year='';c.term='';c.subject=''; }
    if (field==='year') { c.term='';c.subject=''; }
    if (field==='term') c.subject='';
  }
  function renderBatch() { $('batch-fields').innerHTML=fields(batch,'batch',publishing); }
  function updateSummary() {
    const done = queue.filter(item=>item.state==='done').length;
    const pending = queue.length-done;
    $('queue-count').textContent=queue.length;
    $('queue-empty').hidden=Boolean(queue.length);
    $('publish').disabled=publishing || !pending;
    $('clear-queue').disabled=publishing || !queue.some(item=>!item.record);
    $('clear-done').hidden=!done;
    $('clear-done').disabled=publishing;
    $('apply-batch').disabled=publishing || !queue.some(item=>!item.record);
    $('choose-files').disabled=publishing;
    $('drop-zone').setAttribute('aria-disabled',publishing);
    $('batch-status').textContent=publishing ? done+' de '+queue.length+' publicados' : pending+' '+(pending===1?'archivo para publicar':'archivos para publicar')+(done?' · '+done+' publicados':'');
  }
  function renderQueue() {
    const labels={ready:'Pendiente',uploading:'En curso',done:'Publicado',error:'No publicado'};
    $('upload-queue').innerHTML=queue.map(item=>{
      const locked=Boolean(item.record)||publishing;
      return '<li class="upload-item" data-id="'+item.id+'" data-state="'+item.state+'">'+
        '<div class="file-heading"><i data-lucide="'+(item.state==='done'?'file-check-2':'file-text')+'"></i><div><p class="file-name">'+escape(item.file.name)+'</p><p class="file-size">'+(item.file.size/1024/1024).toFixed(2)+' MB</p></div><span class="file-state">'+labels[item.state]+'</span><button type="button" class="icon-button" data-remove title="Quitar archivo" aria-label="Quitar '+escape(item.file.name)+'" '+(locked?'disabled':'')+'><i data-lucide="x"></i></button></div>'+
        '<label class="file-title" for="title-'+item.id+'">Título en la biblioteca<input id="title-'+item.id+'" data-title maxlength="180" value="'+escape(item.title)+'" '+(locked?'disabled':'')+' required></label>'+
        '<div class="classification">'+fields(item.classification,item.id,locked)+'</div>'+
        (item.state==='uploading'?'<progress aria-label="Subiendo '+escape(item.file.name)+'"></progress>':'')+
        (item.feedback?'<p class="file-feedback" role="status">'+escape(item.feedback)+'</p>':'')+
        (item.state==='done'?'<div class="file-result"><a href="'+escape(item.record.file_url)+'" target="_blank" rel="noopener">Abrir archivo</a><a href="index.html#buscar">Ver biblioteca</a></div>':'')+
        '</li>';
    }).join('');
    updateSummary();icons();
  }
  function addFiles(files) {
    if (!authorized || publishing) return;
    const messages=[];
    for (const file of files) {
      const problem=service.validateFile(file);
      if (problem) {messages.push(file.name+': '+problem);continue;}
      if(queue.length>=20) {messages.push('El lote admite hasta 20 archivos.');break;}
      if(queue.reduce((sum,item)=>sum+item.file.size,0)+file.size>250*1024*1024) {messages.push('El lote no puede superar 250 MB.');break;}
      if(queue.some(item=>item.file.name===file.name&&item.file.size===file.size&&item.file.lastModified===file.lastModified)) {messages.push(file.name+': ya está en este lote.');continue;}
      queue.push({id:crypto.randomUUID(),file,title:file.name.replace(/\.[^.]+$/,'').slice(0,180),classification:{...batch},state:'ready',feedback:''});
    }
    message(messages.join('\n'));renderQueue();
  }
  $('batch-fields').addEventListener('change',event=>{
    const field=event.target.dataset.field;if(!field||publishing)return;
    change(batch,field,event.target.value);renderBatch();
    $('batch-'+field)?.focus();
  });
  $('apply-batch').addEventListener('click',()=>{
    if(publishing)return;
    if(!valid(batch)){message('Completá los cinco campos de clasificación del lote.');return;}
    queue.filter(item=>!item.record).forEach(item=>{item.classification={...batch};item.feedback='';});
    message('Clasificación aplicada a los archivos pendientes.');renderQueue();
  });
  $('upload-queue').addEventListener('change',event=>{
    const item=queue.find(item=>item.id===event.target.closest('[data-id]')?.dataset.id);
    if(!item||item.record||publishing)return;
    const field=event.target.dataset.field;
    if(field){change(item.classification,field,event.target.value);renderQueue();$(item.id+'-'+field)?.focus();}
  });
  $('upload-queue').addEventListener('input',event=>{
    const item=queue.find(item=>item.id===event.target.closest('[data-id]')?.dataset.id);
    if(item&&!item.record&&!publishing&&event.target.hasAttribute('data-title'))item.title=event.target.value;
  });
  $('upload-queue').addEventListener('click',event=>{
    if(!event.target.closest('[data-remove]')||publishing)return;
    const id=event.target.closest('[data-id]')?.dataset.id;
    queue=queue.filter(item=>item.id!==id||item.record);renderQueue();
  });
  $('clear-queue').addEventListener('click',()=>{if(!publishing){queue=queue.filter(item=>item.record);renderQueue();}});
  $('clear-done').addEventListener('click',()=>{if(!publishing){queue=queue.filter(item=>item.state!=='done');renderQueue();}});
  $('choose-files').addEventListener('click',()=>$('file-input').click());
  $('file-input').addEventListener('change',event=>{addFiles(event.target.files);event.target.value='';});
  let dragDepth=0;
  $('drop-zone').addEventListener('dragenter',event=>{event.preventDefault();dragDepth++;if(!publishing)$('drop-zone').classList.add('drag-over');});
  $('drop-zone').addEventListener('dragover',event=>{event.preventDefault();event.dataTransfer.dropEffect=publishing?'none':'copy';});
  $('drop-zone').addEventListener('dragleave',()=>{if(--dragDepth<=0){dragDepth=0;$('drop-zone').classList.remove('drag-over');}});
  $('drop-zone').addEventListener('drop',event=>{event.preventDefault();dragDepth=0;$('drop-zone').classList.remove('drag-over');addFiles(event.dataTransfer.files);});
  window.addEventListener('dragover',event=>event.preventDefault());
  window.addEventListener('drop',event=>event.preventDefault());
  window.addEventListener('beforeunload',event=>{if(publishing||queue.some(item=>item.state!=='done')){event.preventDefault();event.returnValue='';}});

  function uploadError(error) {
    const status=String(error?.statusCode||error?.status||'');
    if(['401','403'].includes(status)||error?.code==='42501')return 'No se pudo autorizar la carga. Revisá tu sesión y tus permisos.';
    if(status==='413')return 'El archivo supera el límite permitido por el almacenamiento.';
    return 'No se pudo completar la publicación. Podés volver a pulsar Publicar archivos para reintentar sin duplicarlo.';
  }
  $('publish').addEventListener('click',async()=>{
    if(publishing||!authorized)return;
    const pending=queue.filter(item=>item.state!=='done');
    if(!pending.length)return;
    let invalid=false;
    for(const item of pending){
      item.feedback='';
      if(!item.title.trim()||!valid(item.classification)){item.feedback='Completá el título y la clasificación antes de publicar.';invalid=true;}
    }
    if(invalid){message('Hay archivos con datos incompletos. Revisalos antes de publicar.');renderQueue();return;}
    publishing=true;message('');renderBatch();renderQueue();
    try{
      const check=await client.rpc('is_library_admin');
      if(check.error||check.data!==true)throw new Error('permission');
      for(const item of pending){
        item.state='uploading';item.feedback='';renderQueue();
        try{
          await service.publish(item,access.user,stage=>{
            $('batch-status').textContent=stage+' '+item.file.name;
          });
          item.state='done';
        }catch(error){item.state='error';item.feedback=uploadError(error);}
        renderQueue();
      }
      const failed=queue.filter(item=>item.state==='error').length;
      message(failed?'Quedaron '+failed+' archivos sin publicar. Los demás ya están disponibles en la biblioteca.':'Los archivos ya están publicados en la biblioteca.');
    }catch{message('No pudimos confirmar tus permisos de administrador. No se inició la carga.');}
    finally{publishing=false;renderBatch();renderQueue();}
  });
  renderBatch();renderQueue();
})();

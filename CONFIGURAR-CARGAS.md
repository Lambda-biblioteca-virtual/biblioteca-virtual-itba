# Activar las cargas de Lambda

## Una unica configuracion en Supabase

1. Abrir SQL Editor en el proyecto nlxsidqaqtslaoyuaevc.
2. Si todavia no existe la tabla materials, ejecutar supabase-schema.sql primero.
3. Ejecutar supabase-admin.sql completo. Crea el almacenamiento library-materials,
   la lista de materias y los permisos de administracion.
4. Al terminar aparecen tres consultas: los tres correos administradores, la
   cantidad de materias y el almacenamiento configurado con limite de 50 MB.
5. Cerrar y volver a abrir Lambda con la cuenta institucional de Google.

Los tres administradores tienen el mismo rol y los mismos permisos:
gastella@itba.edu.ar, bviolante@itba.edu.ar y scione@itba.edu.ar.
Ningun usuario puede darse de alta como administrador desde el navegador.
Las altas o bajas de administradores se hacen en SQL Editor.

## Usar el panel

El menu muestra Subir material solamente a los administradores. Tambien pueden
entrar en https://biblioteca-virtual-itba.vercel.app/admin.html.

Elegir una clasificacion del lote, seleccionar o arrastrar los archivos y
revisar el titulo y la clasificacion de cada uno. Aplicar a pendientes permite
usar la misma clasificacion para varios archivos. Publicar archivos realiza
la carga y publica las fichas en la biblioteca sin modificar GitHub.

Se admiten hasta 20 archivos y 250 MB por lote, con un maximo de 50 MB por archivo.
La pagina indica que archivo esta subiendo; no calcula un porcentaje de bytes.
Una vez iniciada una carga, su ficha queda bloqueada para que un reintento
publique exactamente el mismo archivo, sin duplicarlo. Si falla una parte del
lote, los archivos publicados permanecen disponibles y solo se reintentan los
pendientes. No cerrar la pestaña mientras haya cargas pendientes.

Los archivos se guardan con una ruta de administrador/carrera/ano/cuatrimestre/
materia/identificador-nombre. Los buscadores usan las columnas de la ficha.
Una vez publicados no es necesario conservarlos en la computadora para que
funcione la web. Conviene conservar una copia de respaldo por separado.

## Alcance y mantenimiento

El bucket es publico, como los materiales existentes: alguien que tenga el
enlace puede descargar un archivo. Solo administradores pueden cargarlo y
publicar la ficha. La sesion de Google no convierte los archivos en privados.

Almacenamiento y ficha son dos operaciones. Si se interrumpe la publicacion
despues de subir el archivo, el reintento en la misma pestaña reutiliza la carga.
Si se cierra la pestaña en ese estado puede quedar un archivo sin ficha: revisar
Storage antes de eliminarlo. No se borran archivos automaticamente ante un
error de red para evitar eliminar una publicacion que ya haya sido confirmada.

Este panel permite cargar y publicar; no agrega edicion ni borrado de materiales
publicados. Para cambiar planes, actualizar data.js y library_subjects de forma
consistente. Las nuevas publicaciones se verifican contra el catalogo de materias.

Prueba final: publicar un PDF pequeno con cada cuenta de administrador, buscarlo
desde otra cuenta y comprobar apertura y descarga. Una cuenta no administradora
no debe ver el enlace ni poder insertar filas o cargar objetos mediante la API.

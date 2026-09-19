# Lambda · Biblioteca Virtual ITBA

Pagina web para organizar bibliografia, parciales viejos, resumenes, guias y
otros materiales de estudio para estudiantes del ITBA.

## Orden de la biblioteca

La estructura principal es:

1. Carrera
2. Año
3. Cuatrimestre
4. Materia
5. Material

Los planes de estudio originales viven en la carpeta `Carreras`.
Se utilizan para completar los filtros; no se muestran como materiales.

## Navegacion

Inicio presenta la historia de Lambda con una ilustracion original. Buscar
permite combinar carrera, año, cuatrimestre, materia y texto, y aplicar la
seleccion con el boton Buscar. Las categorias filtran por tipo de material.

Cada archivo abre un panel con Abrir, Descargar, Guardar y Reportar.
Guardados muestra solo favoritos, con categorias y sin buscador. Descargas
muestra una lista por fecha de ultima descarga, de mas reciente a mas antigua,
y permite descargar otra vez. Cada archivo aparece una sola vez en la lista.
Guardados y el historial se conservan en este navegador; no se sincronizan
entre dispositivos. El historial anterior se conserva sin inventar fechas.
Reportar abre una incidencia en GitHub y requiere una cuenta de GitHub.
Las descargas externas dependen de los permisos del sitio de origen; cuando
no se permiten, se puede abrir el archivo en su sitio.

Los materiales sin enlace real no se muestran. El campo opcional `cover`
permite usar una imagen de portada; sin imagen se muestra una cubierta con
la materia y el tipo. No se publican archivos de muestra como material real.

Los iconos locales de Lucide (0.468.0) incluyen su licencia en
`lucide-LICENSE.txt`. La interfaz publica usa `library.css`; `styles.css` conserva
los estilos del panel administrador.

## Admin

El panel esta en `admin.html`.

En la web publicada se entra agregando `/admin.html` al dominio:

`https://gaelstella.github.io/biblioteca-virtual-itba/admin.html`

Clave temporal:

`itba-admin`

Importante: GitHub Pages es estatico. El panel admin genera la ficha del
material, pero para que el archivo quede online hay que subirlo al repositorio y
publicar el cambio.

# Activar el acceso a Lambda

La pagina de acceso es https://biblioteca-virtual-itba.vercel.app/login.html.
La aplicacion requiere una sesion con correo ITBA confirmado. El registro,
inicio de sesion, recuperacion y cierre de sesion utilizan Supabase Auth.

## Pasos en Supabase

1. Abrir el proyecto `nlxsidqaqtslaoyuaevc` y entrar a **SQL Editor**.
2. Ejecutar el contenido de `supabase-auth.sql`. Incluye verificaciones del
   dominio sin crear usuarios ni enviar correos.
3. En **Authentication > Hooks**, agregar un hook **Before User Created**
   de tipo Postgres y elegir `public.lambda_before_user_created`. Activarlo.
   Este paso es necesario: crear la funcion SQL por si solo no la activa.
4. En **Authentication > Sign In / Providers > Email**, mantener Email y
   **Confirm email** habilitados. Configurar contrasenas de al menos 8 caracteres.
5. En **Authentication > URL Configuration**, configurar:
   - Site URL: `https://biblioteca-virtual-itba.vercel.app`
   - Redirect URL: `https://biblioteca-virtual-itba.vercel.app/login.html`
   - Redirect URL: `https://biblioteca-virtual-itba.vercel.app/login.html?mode=update`
6. Configurar un proveedor de correo en **Authentication > Email > SMTP Settings**.
   El servicio de prueba de Supabase solo envia a direcciones del equipo y tiene
   limites reducidos. No desactivar la confirmacion para evitar este paso: hay
   que comprobar que cada estudiante tiene acceso al correo que declara.

## Comprobacion real

- Registrarse con un correo ITBA propio, abrir el correo de confirmacion y
  comprobar que se ingresa a la biblioteca.
- Cerrar sesion, iniciar nuevamente y recargar para comprobar persistencia.
- Solicitar la recuperacion, abrir el enlace y cambiar la contrasena.
- Verificar en Authentication > Hooks que el hook esta activo; las validaciones
  del formulario no sustituyen la restriccion del servidor.

## Alcance

Los guardados y las descargas se conservan por cuenta en este navegador; aun
no se sincronizan entre dispositivos. El historial anterior, sin cuenta,
permanece en el navegador pero no se asigna automaticamente a una persona.

Este cambio controla el registro y el acceso desde la interfaz. Los PDFs
existentes en el repositorio y el catalogo publico siguen siendo publicos.
Para privatizarlos se requiere mover los archivos a Storage privado y cambiar
las politicas de acceso. El panel admin anterior sigue siendo un generador
local de fichas, no un sistema de administracion con permisos de Supabase.

Documentacion:
- https://supabase.com/docs/guides/auth/passwords
- https://supabase.com/docs/guides/auth/auth-hooks/before-user-created-hook
- https://supabase.com/docs/guides/auth/auth-smtp

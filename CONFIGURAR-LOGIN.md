# Activar Google en Lambda

El boton de Google crea la cuenta la primera vez e inicia sesion las siguientes.
No necesita SMTP ni un dominio propio. Publicar el codigo no activa Google:
todavia hay que completar la configuracion externa.

## Google Cloud

1. Entrar a https://console.cloud.google.com/ con la cuenta que administrara
   el proyecto (puede ser un Gmail personal). Crear un proyecto llamado Lambda.
2. Abrir Google Auth Platform y seleccionar Get started / Comenzar.
3. Nombre: Lambda. Correo de soporte y contacto: un correo que ustedes controlen.
   Audiencia: External / Externo, salvo que el proyecto pertenezca formalmente
   a la organizacion Google Workspace del ITBA.
4. En Data Access, usar solamente openid, email y profile. No pedir acceso a Gmail.
5. En Audience, si figura Testing, agregar gastella@itba.edu.ar y los correos
   institucionales de los otros integrantes como usuarios de prueba.
   Antes de abrir a todos, revisar los requisitos y pasar a In production.
6. En Clients, crear un cliente OAuth de tipo Web application.
7. Authorized JavaScript origins:
   https://biblioteca-virtual-itba.vercel.app
8. Authorized redirect URIs:
   https://nlxsidqaqtslaoyuaevc.supabase.co/auth/v1/callback
9. Crear y conservar Client ID y Client Secret. El secreto se pega solo en
   Supabase, nunca en GitHub, en el codigo ni en un mensaje del chat.

## Supabase

1. Authentication > Sign In / Providers > Google: habilitar Google y pegar
   Client ID y Client Secret. Guardar. Mantener comprobaciones de nonce y email.
2. Authentication > URL Configuration:
   Site URL: https://biblioteca-virtual-itba.vercel.app
   Redirect URL: https://biblioteca-virtual-itba.vercel.app/login.html
3. Ejecutar supabase-auth.sql en SQL Editor si no se hizo antes.
4. Authentication > Hooks > Before User Created: activar
   public.lambda_before_user_created. Es indispensable para restringir
   la creacion de cuentas en el servidor a @itba.edu.ar.
5. Desactivar Custom SMTP si quedaron datos incompletos de Resend.
   Google no requiere ese servicio. Mantener Confirm email habilitado.
6. Para usar exclusivamente Google, desactivar el proveedor Email.
   Esto tambien deshabilita el acceso por contrasena de cuentas anteriores;
   esas personas deberan usar Google.

## Comprobar

- Abrir https://biblioteca-virtual-itba.vercel.app/login.html.
- Continuar con Google y elegir la cuenta @itba.edu.ar.
- Completar Microsoft Authenticator si lo exige la universidad.
- Comprobar entrada a la biblioteca, persistencia al recargar y cierre de sesion.
- La cuenta debe aparecer en Authentication > Users. Una cuenta ajena al ITBA
  no debe crearse con el hook activo, ni acceder a la interfaz.

El parametro hd de Google es solo una sugerencia de dominio; la restriccion
real de nuevas cuentas corresponde al hook de Supabase. Si la universidad
bloquea apps externas, hay que consultarlo con soporte del ITBA.

Los materiales existentes siguen siendo publicos. Este cambio controla el
registro y el acceso desde la interfaz. Guardados e historial se conservan
por cuenta en cada navegador, sin sincronizacion entre dispositivos.

Documentacion: https://supabase.com/docs/guides/auth/social-login/auth-google

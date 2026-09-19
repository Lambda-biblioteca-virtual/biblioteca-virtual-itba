-- Run once in the Supabase SQL Editor, then enable this function as the
-- Authentication > Hooks > Before User Created hook.
begin;

create or replace function public.lambda_before_user_created(event jsonb)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if coalesce(event->'user'->>'email', '') !~* '^[^[:space:]@]+@itba\.edu\.ar$' then
    return jsonb_build_object('error', jsonb_build_object(
      'http_code', 403,
      'message', 'Solo se permiten cuentas con correo @itba.edu.ar.'
    ));
  end if;
  return '{}'::jsonb;
end;
$$;

revoke execute on function public.lambda_before_user_created(jsonb) from public, anon, authenticated;
grant usage on schema public to supabase_auth_admin;
grant execute on function public.lambda_before_user_created(jsonb) to supabase_auth_admin;

-- Verify both outcomes without creating any real accounts or sending mail.
do $$
begin
  assert public.lambda_before_user_created('{"user":{"email":"student@itba.edu.ar"}}') = '{}'::jsonb;
  assert public.lambda_before_user_created('{"user":{"email":"Student@ITBA.EDU.AR"}}') = '{}'::jsonb;
  assert public.lambda_before_user_created('{"user":{"email":"student@gmail.com"}}')->'error'->>'http_code' = '403';
  assert public.lambda_before_user_created('{"user":{"email":"student@itba.edu.ar.example.com"}}')->'error'->>'http_code' = '403';
  assert public.lambda_before_user_created('{"user":{}}')->'error'->>'http_code' = '403';
end;
$$;

commit;

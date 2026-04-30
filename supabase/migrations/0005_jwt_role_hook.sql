-- 0005_jwt_role_hook.sql
-- Mirror demo.user_profiles.role into the JWT app_metadata at token issuance.
-- Lets middleware read the role from the verified token instead of running a
-- DB query on every navigation.
--
-- After applying this migration: enable the hook in the Supabase Dashboard at
--   Authentication → Hooks → "Customize Access Token (JWT) Claims"
-- and select `public.custom_access_token_hook`.
-- Existing sessions will pick up the claim on their next token refresh.

create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb
language plpgsql
stable
as $$
declare
  claims jsonb;
  user_role text;
begin
  select role
    into user_role
    from demo.user_profiles
   where id = (event->>'user_id')::uuid;

  claims := coalesce(event->'claims', '{}'::jsonb);

  if claims->'app_metadata' is null then
    claims := jsonb_set(claims, '{app_metadata}', '{}'::jsonb);
  end if;

  claims := jsonb_set(
    claims,
    '{app_metadata,role}',
    to_jsonb(coalesce(user_role, 'scientist'))
  );

  return jsonb_set(event, '{claims}', claims);
end;
$$;

grant execute on function public.custom_access_token_hook to supabase_auth_admin;
grant usage on schema demo to supabase_auth_admin;
grant select on demo.user_profiles to supabase_auth_admin;
revoke execute on function public.custom_access_token_hook from authenticated, anon, public;

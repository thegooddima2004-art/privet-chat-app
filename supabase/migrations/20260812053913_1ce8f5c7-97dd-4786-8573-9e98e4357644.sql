revoke all on function public.hash_invite_code(text) from public, anon, authenticated;
grant execute on function public.hash_invite_code(text) to service_role;

revoke all on function public.create_invite() from public, anon;
grant execute on function public.create_invite() to authenticated, service_role;

revoke all on function public.has_role(uuid, public.app_role) from public, anon;
grant execute on function public.has_role(uuid, public.app_role) to authenticated, service_role;
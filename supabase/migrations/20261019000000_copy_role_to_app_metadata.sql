-- Copies each user's role from user_metadata to app_metadata.
--
-- user_metadata can be edited by the signed-in user (auth.updateUser), so a
-- role stored there can't be trusted. app_metadata can only be written with
-- the service role. user_metadata.role is left in place for now; the apps
-- that still read it keep working until they move over.

update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb)
  || jsonb_build_object('role', raw_user_meta_data ->> 'role')
where raw_user_meta_data ? 'role'
  and raw_user_meta_data ->> 'role' in ('admin', 'agent');

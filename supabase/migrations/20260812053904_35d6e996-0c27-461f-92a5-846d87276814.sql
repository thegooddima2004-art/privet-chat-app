-- ============ ПРОФИЛИ ============
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  username text unique not null,
  avatar_url text,
  is_bot boolean not null default false,
  invited_by uuid references public.profiles(id) on delete set null,
  last_seen_at timestamptz,
  created_at timestamptz not null default now()
);

grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;

create policy "Вошедшие видят профили" on public.profiles
  for select to authenticated using (true);
create policy "Пользователь меняет свой профиль" on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- ============ РОЛИ ============
create type public.app_role as enum ('admin', 'user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create policy "Пользователь видит свои роли" on public.user_roles
  for select to authenticated using (user_id = auth.uid());

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

-- ============ ПРИГЛАШЕНИЯ ============
create table public.invites (
  id uuid primary key default gen_random_uuid(),
  code_hash text not null unique,
  created_by uuid references public.profiles(id) on delete cascade,
  used_by uuid references public.profiles(id) on delete set null,
  used_at timestamptz,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);
create index invites_created_by_idx on public.invites (created_by);

grant select on public.invites to authenticated;
grant all on public.invites to service_role;
alter table public.invites enable row level security;

create policy "Пользователь видит свои приглашения" on public.invites
  for select to authenticated using (created_by = auth.uid());

-- хэш кода (соль не нужна: код проверяется только на сервере, таблица закрыта RLS)
create or replace function public.hash_invite_code(_code text)
returns text language sql immutable set search_path = public as $$
  select encode(sha256(convert_to(_code, 'UTF8')), 'hex')
$$;

-- создание кода текущим пользователем (возвращает сам код один раз)
create or replace function public.create_invite()
returns table (code text, expires_at timestamptz)
language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  active_count int;
  new_code text;
  exp timestamptz := now() + interval '24 hours';
  i int;
begin
  if uid is null then
    raise exception 'Требуется вход в аккаунт';
  end if;

  select count(*) into active_count from public.invites
   where created_by = uid and used_by is null and used_at is null and invites.expires_at > now();
  if active_count >= 5 then
    raise exception 'Достигнут лимит активных приглашений (5)';
  end if;

  for i in 1..10 loop
    new_code := lpad((100000 + floor(random() * 900000))::int::text, 6, '0');
    begin
      insert into public.invites (code_hash, created_by, expires_at)
      values (public.hash_invite_code(new_code), uid, exp);
      return query select new_code, exp;
      return;
    exception when unique_violation then
      null;
    end;
  end loop;

  raise exception 'Не удалось создать код, попробуйте ещё раз';
end $$;

-- атомарное погашение кода при регистрации (только service_role)
create or replace function public.consume_invite(_code text, _user_id uuid)
returns uuid language plpgsql security definer set search_path = public as $$
declare inviter uuid;
begin
  update public.invites
     set used_by = _user_id, used_at = now()
   where code_hash = public.hash_invite_code(_code)
     and used_by is null and used_at is null
     and expires_at > now()
  returning created_by into inviter;

  if not found then
    raise exception 'invite_invalid';
  end if;
  return inviter;
end $$;

revoke all on function public.consume_invite(text, uuid) from public, anon, authenticated;
grant execute on function public.consume_invite(text, uuid) to service_role;

-- проверка кода без погашения (для формы регистрации)
create or replace function public.is_invite_valid(_code text)
returns boolean language sql security definer set search_path = public as $$
  select exists (
    select 1 from public.invites
     where code_hash = public.hash_invite_code(_code)
       and used_by is null and used_at is null and expires_at > now()
  )
$$;
revoke all on function public.is_invite_valid(text) from public, anon, authenticated;
grant execute on function public.is_invite_valid(text) to service_role;

-- ============ СТАРТОВЫЕ КОДЫ ============
insert into public.invites (code_hash, created_by, expires_at) values
  (public.hash_invite_code('428193'), null, now() + interval '30 days'),
  (public.hash_invite_code('571046'), null, now() + interval '30 days'),
  (public.hash_invite_code('960327'), null, now() + interval '30 days');
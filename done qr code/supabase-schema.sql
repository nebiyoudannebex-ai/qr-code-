create table if not exists public.users (
  id text primary key,
  username text not null unique,
  password_hash text not null,
  role text not null,
  business_name text not null,
  logo_url text,
  created_at text not null,
  account_type text,
  account_status text,
  expiry_date text,
  last_notified text
);

create table if not exists public.banking_details (
  id text primary key,
  user_id text not null references public.users(id) on delete cascade,
  bank_name text not null,
  account_number text not null,
  pay_link text,
  is_active boolean not null default true,
  created_at text not null
);

create table if not exists public.audit_logs (
  id text primary key,
  user_id text,
  username text,
  action text not null,
  details text not null,
  created_at text not null
);

create table if not exists public.sessions (
  token text primary key,
  user_id text not null references public.users(id) on delete cascade,
  expires_at text not null,
  created_at text not null
);

create index if not exists idx_sessions_user_id on public.sessions(user_id);
create index if not exists idx_sessions_expires_at on public.sessions(expires_at);
create index if not exists idx_banking_details_user_id on public.banking_details(user_id);
create index if not exists idx_audit_logs_created_at on public.audit_logs(created_at);

create table if not exists public.materials (
  id text primary key,
  career_id text not null,
  year smallint not null check (year between 1 and 6),
  term smallint not null check (term in (1, 2)),
  subject text not null,
  type text not null,
  title text not null,
  file_url text not null,
  status text default 'Abrir material',
  cover_url text,
  created_at timestamptz not null default now()
);

alter table public.materials enable row level security;

drop policy if exists "Anyone can read published materials" on public.materials;
create policy "Anyone can read published materials"
on public.materials
for select
to anon, authenticated
using (true);

grant select on public.materials to anon, authenticated;

insert into public.materials (
  id,
  career_id,
  year,
  term,
  subject,
  type,
  title,
  file_url,
  status
) values (
  'informatica-analisis-2-parcial-2025-1c-b',
  'informatica',
  1,
  2,
  'Analisis Matematico II',
  'Parcial',
  'Primer parcial · 2025 · 1C · Tema B',
  'Parciales/Primer Parcial - 2025 - 1C - B.pdf',
  'Abrir material'
) on conflict (id) do update set
  career_id = excluded.career_id,
  year = excluded.year,
  term = excluded.term,
  subject = excluded.subject,
  type = excluded.type,
  title = excluded.title,
  file_url = excluded.file_url,
  status = excluded.status;

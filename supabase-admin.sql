-- Run supabase-schema.sql first if the materials table does not exist.
-- Run this file once in the project's SQL Editor as the postgres role.
begin;

create table if not exists public.library_admins (
  email text primary key check (email = lower(email) and email ~ '^[^[:space:]@]+@itba\.edu\.ar$')
);
alter table public.library_admins enable row level security;
revoke all on public.library_admins from anon, authenticated;
grant select on public.library_admins to authenticated;
drop policy if exists "Admins see their own membership" on public.library_admins;
create policy "Admins see their own membership" on public.library_admins
for select to authenticated
using ((select auth.uid()) is not null and email = lower((select auth.jwt()->>'email')));

insert into public.library_admins(email) values
('gastella@itba.edu.ar'), ('bviolante@itba.edu.ar'), ('scione@itba.edu.ar')
on conflict do nothing;

create or replace function public.is_library_admin()
returns boolean language sql stable security invoker set search_path = ''
as $$
  select auth.uid() is not null and exists (
    select 1 from public.library_admins where email = lower(auth.jwt()->>'email')
  );
$$;
revoke all on function public.is_library_admin() from public, anon;
grant execute on function public.is_library_admin() to authenticated;

create table if not exists public.library_subjects (
  career_id text not null,
  year smallint not null check (year between 1 and 6),
  term smallint not null check (term in (1,2)),
  subject text not null,
  primary key (career_id, year, term, subject)
);
alter table public.library_subjects enable row level security;
revoke all on public.library_subjects from anon, authenticated;
grant select on public.library_subjects to anon, authenticated;
drop policy if exists "Read subject catalog" on public.library_subjects;
create policy "Read subject catalog" on public.library_subjects for select to anon, authenticated using (true);
insert into public.library_subjects(career_id, year, term, subject) values
('informatica', 1, 1, 'Sistemas de Representacion'),
('informatica', 1, 1, 'Introduccion a la Informatica'),
('informatica', 1, 1, 'Analisis Matematico I'),
('informatica', 1, 1, 'Algebra'),
('informatica', 1, 1, 'Metodologia del Aprendizaje'),
('informatica', 1, 2, 'Programacion Imperativa'),
('informatica', 1, 2, 'Analisis Matematico II'),
('informatica', 1, 2, 'Fisica I'),
('informatica', 1, 2, 'Matematica Discreta'),
('informatica', 2, 1, 'Quimica'),
('informatica', 2, 1, 'Diseño y Procesamiento de Documentos XML'),
('informatica', 2, 1, 'Programacion Orientada a Objetos'),
('informatica', 2, 1, 'Logica Computacional'),
('informatica', 2, 1, 'Fisica II'),
('informatica', 2, 2, 'Arquitectura de Computadoras'),
('informatica', 2, 2, 'Estructura de Datos y Algoritmos'),
('informatica', 2, 2, 'Probabilidad y Estadistica'),
('informatica', 2, 2, 'Fisica III'),
('informatica', 3, 1, 'Sistemas Operativos'),
('informatica', 3, 1, 'Ingenieria de Software I'),
('informatica', 3, 1, 'Interaccion Hombre-Computadora'),
('informatica', 3, 1, 'Base de Datos I'),
('informatica', 3, 2, 'Protocolos de Comunicacion'),
('informatica', 3, 2, 'Proyecto de Aplicaciones Web'),
('informatica', 3, 2, 'Automatas, Teoria de Lenguaje y Compiladores'),
('informatica', 3, 2, 'Metodos Numericos'),
('informatica', 3, 2, 'Formacion General I'),
('informatica', 3, 2, 'Ingles I'),
('informatica', 4, 1, 'Economia para Ingenieros'),
('informatica', 4, 1, 'Derecho para Ingenieros'),
('informatica', 4, 1, 'Ingenieria del Software II'),
('informatica', 4, 1, 'Base de Datos II'),
('informatica', 4, 1, 'Programacion de Objetos Distribuidos'),
('informatica', 4, 1, 'Metodos Numericos Avanzados'),
('informatica', 4, 2, 'Simulacion de Sistemas'),
('informatica', 4, 2, 'Sistemas de Inteligencia Artificial'),
('informatica', 4, 2, 'Gestion de Proyectos Informaticos'),
('informatica', 4, 2, 'Criptografia y Seguridad'),
('industrial', 1, 1, 'Quimica General'),
('industrial', 1, 1, 'Informatica General'),
('industrial', 1, 1, 'Analisis Matematico I'),
('industrial', 1, 1, 'Algebra Lineal'),
('industrial', 1, 1, 'Tecnologia y Sociedad'),
('industrial', 1, 2, 'Biologia'),
('industrial', 1, 2, 'Sistemas de Representacion'),
('industrial', 1, 2, 'Gestion de Datos'),
('industrial', 1, 2, 'Analisis Matematico II'),
('industrial', 1, 2, 'Fisica I'),
('industrial', 2, 1, 'Mecanica de Solidos'),
('industrial', 2, 1, 'Analisis Matematico III'),
('industrial', 2, 1, 'Probabilidad'),
('industrial', 2, 1, 'Fisica II'),
('industrial', 2, 2, 'Sistemas Complejos'),
('industrial', 2, 2, 'Estadistica Aplicada'),
('industrial', 2, 2, 'Mecanica de Fluidos'),
('industrial', 2, 2, 'Analisis Matematico IV'),
('industrial', 2, 2, 'Metodos Numericos'),
('industrial', 2, 2, 'Fisica III'),
('industrial', 3, 1, 'Organizacion de la Produccion I'),
('industrial', 3, 1, 'Materiales y Procesos'),
('industrial', 3, 1, 'Principios y Aplicaciones Electricas'),
('industrial', 3, 1, 'Fisica IV'),
('industrial', 3, 1, 'Metodologia del Diseño'),
('industrial', 3, 2, 'Supply Chain'),
('industrial', 3, 2, 'Investigacion Operativa'),
('industrial', 3, 2, 'Termodinamica y sus aplicaciones'),
('industrial', 3, 2, 'Proyecto Interdisciplinario'),
('industrial', 4, 1, 'Tecnologias y Procesos de Produccion'),
('industrial', 4, 1, 'Electronica e Instrumentacion'),
('industrial', 4, 1, 'Economia Empresaria'),
('industrial', 4, 1, 'Certificaciones tecnologicas'),
('industrial', 4, 1, 'Ingles I'),
('industrial', 4, 2, 'Gestion Ambiental'),
('industrial', 4, 2, 'Simulacion'),
('industrial', 4, 2, 'Economia'),
('industrial', 4, 2, 'Derecho para Ingenieros'),
('mecanica', 1, 1, 'Quimica General'),
('mecanica', 1, 1, 'Informatica General'),
('mecanica', 1, 1, 'Analisis Matematico I'),
('mecanica', 1, 1, 'Algebra Lineal'),
('mecanica', 1, 1, 'Tecnologia y Sociedad'),
('mecanica', 1, 1, 'Biologia'),
('mecanica', 1, 2, 'Ciencia de Materiales I'),
('mecanica', 1, 2, 'Introduccion a la Ingenieria Mecanica'),
('mecanica', 1, 2, 'Sistemas de Representacion'),
('mecanica', 1, 2, 'Certificaciones tecnologicas'),
('mecanica', 1, 2, 'Analisis Matematico II'),
('mecanica', 1, 2, 'Fisica I'),
('mecanica', 2, 1, 'Diseño Mecanico I'),
('mecanica', 2, 1, 'Laboratorio de Diseño Mecanico'),
('mecanica', 2, 1, 'Estructura de Datos y Programacion'),
('mecanica', 2, 1, 'Analisis Matematico III'),
('mecanica', 2, 1, 'Fisica II'),
('mecanica', 2, 2, 'Diseño Mecanico II'),
('mecanica', 2, 2, 'Termodinamica'),
('mecanica', 2, 2, 'Analisis Matematico IV'),
('mecanica', 2, 2, 'Metodos Numericos'),
('mecanica', 2, 2, 'Fisica III'),
('mecanica', 3, 1, 'Electrotecnia'),
('mecanica', 3, 1, 'Ciencia de Materiales II'),
('mecanica', 3, 1, 'Diseño Mecanico III A'),
('mecanica', 3, 1, 'Diseño Mecanico III B'),
('mecanica', 3, 1, 'Fisica IV'),
('mecanica', 3, 2, 'Metodologia del Diseño'),
('mecanica', 3, 2, 'Diseño Mecanico IV'),
('mecanica', 3, 2, 'Termofluidos I'),
('mecanica', 3, 2, 'Probabilidad y Estadistica'),
('mecanica', 3, 2, 'Proyecto Interdisciplinario'),
('mecanica', 3, 2, 'Electivas'),
('mecanica', 4, 1, 'Organizacion Industrial'),
('mecanica', 4, 1, 'Electronica e Instrumentacion'),
('mecanica', 4, 1, 'Termofluidos II'),
('mecanica', 4, 1, 'Instalaciones Industriales'),
('mecanica', 4, 1, 'Analisis de Coyuntura Economica'),
('mecanica', 4, 2, 'Derecho para Ingenieros'),
('mecanica', 4, 2, 'Seguridad Ocupacional y Ambiental'),
('mecanica', 4, 2, 'Sistemas de Control'),
('mecanica', 4, 2, 'Mantenimiento Industrial'),
('mecanica', 4, 2, 'Maquinas Termicas e Hidraulicas'),
('mecanica', 4, 2, 'Introduccion a las Finanzas'),
('quimica', 1, 1, 'Quimica General'),
('quimica', 1, 1, 'Informatica General'),
('quimica', 1, 1, 'Analisis Matematico I'),
('quimica', 1, 1, 'Algebra Lineal'),
('quimica', 1, 1, 'Tecnologia y Sociedad'),
('quimica', 1, 2, 'Quimica Inorganica'),
('quimica', 1, 2, 'Introduccion a la Ingenieria Quimica'),
('quimica', 1, 2, 'Sistemas de Representacion'),
('quimica', 1, 2, 'Certificaciones tecnologicas'),
('quimica', 1, 2, 'Analisis Matematico II'),
('quimica', 1, 2, 'Fisica I'),
('quimica', 2, 1, 'Quimica Organica I'),
('quimica', 2, 1, 'Biologia'),
('quimica', 2, 1, 'Procesos Industriales'),
('quimica', 2, 1, 'Analisis Matematico III'),
('quimica', 2, 1, 'Fisica II'),
('quimica', 2, 2, 'Quimica Organica II'),
('quimica', 2, 2, 'Analisis Matematico IV'),
('quimica', 2, 2, 'Metodos Numericos'),
('quimica', 2, 2, 'Probabilidad y Estadistica'),
('quimica', 2, 2, 'Fisica III'),
('quimica', 3, 1, 'Quimica Analitica'),
('quimica', 3, 1, 'Quimica-Fisica'),
('quimica', 3, 1, 'Bioquimica y Microbiologia Aplicadas'),
('quimica', 3, 1, 'Materiales para la Industria Quimica'),
('quimica', 3, 1, 'Metodologia del Diseño'),
('quimica', 3, 2, 'Termodinamica'),
('quimica', 3, 2, 'Fenomenos de Transporte'),
('quimica', 3, 2, 'Electrotecnia'),
('quimica', 3, 2, 'Instalaciones Mecanicas en Plantas de Proceso'),
('quimica', 3, 2, 'Proyecto Interdisciplinario'),
('quimica', 4, 1, 'Operaciones Unitarias I'),
('quimica', 4, 1, 'Operaciones Unitarias II'),
('quimica', 4, 1, 'Ingenieria de Reacciones y Reactores I'),
('quimica', 4, 1, 'Derecho para Ingenieros'),
('quimica', 4, 2, 'Operaciones Unitarias III'),
('quimica', 4, 2, 'Ingenieria de Reacciones y Reactores II'),
('quimica', 4, 2, 'Simulacion de Procesos'),
('quimica', 4, 2, 'Control de Procesos'),
('civil', 1, 1, 'Quimica General'),
('civil', 1, 1, 'Informatica General'),
('civil', 1, 1, 'Analisis Matematico I'),
('civil', 1, 1, 'Algebra Lineal'),
('civil', 1, 1, 'Tecnologia y Sociedad'),
('civil', 1, 2, 'Biologia'),
('civil', 1, 2, 'Sistemas de Representacion'),
('civil', 1, 2, 'Introduccion a la tematica social'),
('civil', 1, 2, 'Certificaciones Tecnologicas'),
('civil', 1, 2, 'Analisis Matematico II'),
('civil', 1, 2, 'Fisica I'),
('civil', 2, 1, 'Estatica'),
('civil', 2, 1, 'Analisis Matematico III'),
('civil', 2, 1, 'Probabilidad y Estadistica'),
('civil', 2, 1, 'Fisica II'),
('civil', 2, 2, 'Mecanica de Fluidos'),
('civil', 2, 2, 'Tecnologia de materiales'),
('civil', 2, 2, 'Resistencia de Materiales'),
('civil', 2, 2, 'Fisica III'),
('civil', 3, 1, 'Organizacion Industrial'),
('civil', 3, 1, 'Tecnologia del Hormigon'),
('civil', 3, 1, 'Construcciones'),
('civil', 3, 1, 'Analisis Estructural'),
('civil', 3, 1, 'Metodos Numericos'),
('civil', 3, 1, 'Metodologia del Diseño'),
('civil', 3, 2, 'Geologia I'),
('civil', 3, 2, 'Geotopografia'),
('civil', 3, 2, 'Instalaciones'),
('civil', 3, 2, 'Hormigon I'),
('civil', 3, 2, 'Proyecto Interdisciplinario'),
('electronica', 1, 1, 'Quimica General'),
('electronica', 1, 1, 'Principios de Informatica'),
('electronica', 1, 1, 'Analisis Matematico I'),
('electronica', 1, 1, 'Algebra Lineal'),
('electronica', 1, 1, 'Tecnologia y Sociedad'),
('electronica', 1, 2, 'Fundamentos de Electronica'),
('electronica', 1, 2, 'Programacion I'),
('electronica', 1, 2, 'Sistemas de Representacion'),
('electronica', 1, 2, 'Analisis Matematico II'),
('electronica', 1, 2, 'Fisica I'),
('electronica', 2, 1, 'Algoritmos y Estructuras de Datos'),
('electronica', 2, 1, 'Analisis Matematico III'),
('electronica', 2, 1, 'Matematica Discreta'),
('electronica', 2, 1, 'Probabilidad y Estadistica'),
('electronica', 2, 1, 'Fisica II'),
('electronica', 2, 2, 'Biologia'),
('electronica', 2, 2, 'Teoria de Circuitos'),
('electronica', 2, 2, 'Analisis Matematico IV'),
('electronica', 2, 2, 'Metodos Numericos'),
('electronica', 2, 2, 'Fisica III'),
('electronica', 3, 1, 'Tecnologia de Materiales Electronicos'),
('electronica', 3, 1, 'Laboratorio de Electronica I'),
('electronica', 3, 1, 'Fisica Electronica'),
('electronica', 3, 1, 'Analisis Matematico V'),
('electronica', 3, 1, 'Fisica IV'),
('electronica', 3, 2, 'Metodologia del Diseño'),
('electronica', 3, 2, 'Teoria de Circuitos II'),
('electronica', 3, 2, 'Electronica I'),
('electronica', 3, 2, 'Laboratorio de Electronica II'),
('electronica', 3, 2, 'Electronica II'),
('electronica', 3, 2, 'Proyecto Interdisciplinario'),
('bioingenieria', 1, 1, 'Quimica General'),
('bioingenieria', 1, 1, 'Informatica General'),
('bioingenieria', 1, 1, 'Analisis Matematico I'),
('bioingenieria', 1, 1, 'Algebra Lineal'),
('bioingenieria', 1, 1, 'Tecnologia y Sociedad'),
('bioingenieria', 1, 2, 'Fundamentos de Quimica Organica'),
('bioingenieria', 1, 2, 'Biologia'),
('bioingenieria', 1, 2, 'Sistemas de Representacion'),
('bioingenieria', 1, 2, 'Analisis Matematico II'),
('bioingenieria', 1, 2, 'Fisica I'),
('bioingenieria', 2, 1, 'Biologia Molecular y Celular'),
('bioingenieria', 2, 1, 'Estructura de Datos y Programacion'),
('bioingenieria', 2, 1, 'Analisis Matematico III'),
('bioingenieria', 2, 1, 'Fisica II'),
('bioingenieria', 2, 1, 'Histologia y Anatomia'),
('bioingenieria', 2, 2, 'Analisis Matematico IV'),
('bioingenieria', 2, 2, 'Probabilidad y Estadistica'),
('bioingenieria', 2, 2, 'Fisica III'),
('bioingenieria', 3, 1, 'Fisiologia'),
('bioingenieria', 3, 1, 'Mecanica de Biomateriales y Tejidos'),
('bioingenieria', 3, 1, 'Electrotecnia'),
('bioingenieria', 3, 1, 'Fisica IV'),
('bioingenieria', 3, 1, 'Metodologia del Diseño'),
('bioingenieria', 3, 2, 'Ingenieria en Rehabilitacion'),
('bioingenieria', 3, 2, 'Fisica Medica'),
('bioingenieria', 3, 2, 'Señales y Sistemas'),
('bioingenieria', 3, 2, 'Electronica Analogica y Digital'),
('bioingenieria', 3, 2, 'Metodos Numericos'),
('bioingenieria', 3, 2, 'Proyecto interdisciplinario'),
('biotecnologia', 1, 1, 'Analisis Matematico I'),
('biotecnologia', 1, 1, 'Algebra lineal'),
('biotecnologia', 1, 1, 'Informatica General'),
('biotecnologia', 1, 1, 'Quimica General'),
('biotecnologia', 1, 1, 'Tecnologia y Sociedad'),
('biotecnologia', 1, 2, 'Analisis Matematico II'),
('biotecnologia', 1, 2, 'Sistemas de Representacion'),
('biotecnologia', 1, 2, 'Fundamentos de Quimica Organica'),
('biotecnologia', 1, 2, 'Fisica I'),
('biotecnologia', 1, 2, 'Biologia'),
('biotecnologia', 1, 2, 'Ingles I'),
('biotecnologia', 1, 2, 'Introduccion a la Biotecnologia'),
('biotecnologia', 2, 1, 'Analisis Matematico III'),
('biotecnologia', 2, 1, 'Quimica Analitica'),
('biotecnologia', 2, 1, 'Fisica II'),
('biotecnologia', 2, 1, 'Bioquimica y Microbiologia Aplicadas'),
('biotecnologia', 2, 2, 'Analisis Matematico IV'),
('biotecnologia', 2, 2, 'Probabilidad y Estadistica'),
('biotecnologia', 2, 2, 'Quimica-Fisica'),
('biotecnologia', 2, 2, 'Biologia Molecular y Celular'),
('biotecnologia', 2, 2, 'Ingles II'),
('biotecnologia', 3, 1, 'Metodos Numericos'),
('biotecnologia', 3, 1, 'Metodologia del Diseño'),
('biotecnologia', 3, 1, 'Fenomenos de Transporte'),
('biotecnologia', 3, 1, 'Termodinamica'),
('biotecnologia', 3, 1, 'Fisiologia y Genetica de Microorganismos'),
('biotecnologia', 3, 2, 'Sistemas de Control'),
('biotecnologia', 3, 2, 'Operaciones Unitarias I'),
('biotecnologia', 3, 2, 'Bioprocesos'),
('biotecnologia', 3, 2, 'Proyecto interdisciplinario'),
('biotecnologia', 3, 2, 'Organizacion Industrial'),
('naval', 1, 1, 'Quimica General'),
('naval', 1, 1, 'Informatica General'),
('naval', 1, 1, 'Analisis Matematico I'),
('naval', 1, 1, 'Algebra Lineal'),
('naval', 1, 1, 'Tecnologia y Sociedad'),
('naval', 1, 2, 'Ciencia de Materiales I'),
('naval', 1, 2, 'Sistemas de Representacion'),
('naval', 1, 2, 'Introduccion a la Ing. Naval'),
('naval', 1, 2, 'Certificaciones tecnologicas'),
('naval', 1, 2, 'Analisis Matematico II'),
('naval', 1, 2, 'Fisica I'),
('naval', 2, 1, 'Biologia'),
('naval', 2, 1, 'Diseño Mecanico I'),
('naval', 2, 1, 'Estructura de Datos y Programacion'),
('naval', 2, 1, 'Analisis Matematico III'),
('naval', 2, 1, 'Fisica II'),
('naval', 2, 2, 'Diseño Mecanico II'),
('naval', 2, 2, 'Termodinamica'),
('naval', 2, 2, 'Analisis Matematico IV'),
('naval', 2, 2, 'Metodos Numericos'),
('naval', 2, 2, 'Fisica III'),
('naval', 3, 1, 'Ciencia de Materiales II'),
('naval', 3, 1, 'Diseño Mecanico III A'),
('naval', 3, 1, 'Diseño Mecanico III B'),
('naval', 3, 1, 'Hidrostatica y Estabilidad'),
('naval', 3, 1, 'Fisica IV'),
('naval', 3, 2, 'Metodologia del Diseño'),
('naval', 3, 2, 'Electrotecnia'),
('naval', 3, 2, 'Mecanica de Fluidos'),
('naval', 3, 2, 'Resistencia y Propulsion'),
('naval', 3, 2, 'Probabilidad y Estadistica'),
('naval', 3, 2, 'Proyecto Interdisciplinario'),
('petroleo', 1, 1, 'Quimica General'),
('petroleo', 1, 1, 'Informatica General'),
('petroleo', 1, 1, 'Analisis Matematico I'),
('petroleo', 1, 1, 'Algebra Lineal'),
('petroleo', 1, 1, 'Tecnologia y Sociedad'),
('petroleo', 1, 2, 'Quimica Organica para Petroleo'),
('petroleo', 1, 2, 'Sistemas de Representacion'),
('petroleo', 1, 2, 'Introduccion a la Ingenieria en Petroleo'),
('petroleo', 1, 2, 'Analisis Matematico II'),
('petroleo', 1, 2, 'Fisica I'),
('petroleo', 2, 1, 'Estructura de Datos y Programacion'),
('petroleo', 2, 1, 'Analisis Matematico III'),
('petroleo', 2, 1, 'Probabilidad y Estadistica'),
('petroleo', 2, 1, 'Fisica II'),
('petroleo', 2, 1, 'Biologia'),
('petroleo', 2, 2, 'Estatica y Resistencia de Materiales'),
('petroleo', 2, 2, 'Geologia I'),
('petroleo', 2, 2, 'Analisis Matematico IV'),
('petroleo', 2, 2, 'Metodos Numericos'),
('petroleo', 2, 2, 'Fisica III'),
('petroleo', 3, 1, 'Electrotecnia'),
('petroleo', 3, 1, 'Termodinamica'),
('petroleo', 3, 1, 'Mecanica de Fluidos'),
('petroleo', 3, 1, 'Geofisica de Reservorios'),
('petroleo', 3, 1, 'Fisica IV'),
('petroleo', 3, 1, 'Metodologia del Diseño'),
('petroleo', 3, 2, 'Organizacion Industrial'),
('petroleo', 3, 2, 'Seguridad Ocupacional y Ambiental'),
('petroleo', 3, 2, 'Maquinas Electricas'),
('petroleo', 3, 2, 'Introduccion a Mecanica de Rocas'),
('petroleo', 3, 2, 'Petrofisica y Fluidos de Reservorio'),
('petroleo', 3, 2, 'Ingenieria de Perforacion I'),
('petroleo', 3, 2, 'Proyecto Interdisciplinario')
on conflict do nothing;

alter table public.materials
  add column if not exists storage_path text,
  add column if not exists original_name text,
  add column if not exists file_size bigint,
  add column if not exists uploaded_by uuid;
create unique index if not exists materials_storage_path_unique on public.materials(storage_path);
alter table public.materials enable row level security;
grant insert on public.materials to authenticated;

insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values ('library-materials', 'library-materials', true, 52428800, array[
  'application/pdf','application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain','application/zip','image/jpeg','image/png','image/webp'
])
on conflict (id) do update set public = excluded.public,
file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Lambda admins upload own files" on storage.objects;
create policy "Lambda admins upload own files" on storage.objects
for insert to authenticated with check (
  bucket_id = 'library-materials'
  and (select public.is_library_admin())
  and (storage.foldername(name))[1] = (select auth.uid())::text
);
drop policy if exists "Lambda admins inspect own uploads" on storage.objects;
create policy "Lambda admins inspect own uploads" on storage.objects
for select to authenticated using (
  bucket_id = 'library-materials'
  and (select public.is_library_admin())
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists "Lambda admins publish materials" on public.materials;
create policy "Lambda admins publish materials" on public.materials
for insert to authenticated with check (
  (select public.is_library_admin())
  and uploaded_by = (select auth.uid())
  and char_length(trim(title)) between 1 and 180
  and char_length(original_name) between 1 and 1024
  and file_size between 1 and 52428800
  and type in ('Resumen','Parcial','Bibliografia','Guia','TP')
  and file_url = 'https://nlxsidqaqtslaoyuaevc.supabase.co/storage/v1/object/public/library-materials/' || storage_path
  and split_part(storage_path, '/', 1) = (select auth.uid())::text
  and split_part(storage_path, '/', 2) = career_id
  and split_part(storage_path, '/', 3) = year::text
  and split_part(storage_path, '/', 4) = term::text
  and exists (
    select 1 from public.library_subjects s where
      s.career_id = materials.career_id and s.year = materials.year
      and s.term = materials.term and s.subject = materials.subject
  )
  and exists (
    select 1 from storage.objects o where
      o.bucket_id = 'library-materials' and o.name = materials.storage_path
      and (o.metadata->>'size')::bigint = materials.file_size
  )
);

commit;

-- Verification: three equal admins, subject catalog and configured bucket.
select email from public.library_admins order by email;
select count(*) as classified_subjects from public.library_subjects;
select id, public, file_size_limit from storage.buckets where id = 'library-materials';

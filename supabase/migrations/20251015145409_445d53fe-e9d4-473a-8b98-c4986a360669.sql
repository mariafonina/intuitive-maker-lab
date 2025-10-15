-- Create storage bucket for images
insert into storage.buckets (id, name, public)
values ('images', 'images', true);

-- Create table for image metadata
create table public.images (
  id uuid primary key default gen_random_uuid(),
  filename text not null,
  storage_path text not null,
  url text not null,
  uploaded_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.images enable row level security;

-- Allow anyone to view images
create policy "Anyone can view images"
on public.images
for select
to anon, authenticated
using (true);

-- Allow anyone to upload images
create policy "Anyone can upload images"
on public.images
for insert
to anon, authenticated
with check (true);

-- Storage policies for public access
create policy "Anyone can view images in storage"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'images');

create policy "Anyone can upload images to storage"
on storage.objects
for insert
to anon, authenticated
with check (bucket_id = 'images');
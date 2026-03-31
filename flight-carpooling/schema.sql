-- Run this in your Supabase SQL editor to set up the database schema.

create table if not exists travelers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text not null,
  arrival_flight text,
  arrival_time timestamptz not null,
  departure_time timestamptz not null,
  luggage text not null check (luggage in ('carry-on only', '1 checked bag', '2+ checked bags')),
  notes text,
  created_at timestamptz not null default now()
);

-- Optional: enable Row Level Security and allow public inserts/reads for this internal tool
alter table travelers enable row level security;

-- Allow anyone to insert (submit the form)
create policy "Allow public inserts" on travelers
  for insert with check (true);

-- Allow anyone to read (for /matches page)
create policy "Allow public reads" on travelers
  for select using (true);

-- Allow updates (for /edit/[id] page)
create policy "Allow public updates" on travelers
  for update using (true) with check (true);

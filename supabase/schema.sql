-- Pamo: Supabase schema (Architecture §5.3).
-- Run once in the Supabase SQL editor. Safe to run again: nothing is dropped.
--
-- Only Express reads and writes these tables, with the service key.
-- Row Level Security is on with no policies, so the anon key can read nothing.

-- Pots as seen in PotOpened events (names live only in events, so we index them)
create table if not exists pots (
  id            bigint primary key,          -- pot id from the contract
  owner         text not null,               -- lowercase 0x address
  kind          text not null check (kind in ('anytime','goal')),
  tier          text not null check (tier in ('calm','steady','bold')),
  vault         text not null,               -- lowercase 0x address
  name          text,
  target        numeric,                     -- USDC, 6 dp as integer units (goal pots only)
  unlock_at     timestamptz,                 -- goal pots only
  opened_tx     text not null,
  opened_block  bigint not null
);
create index if not exists pots_owner_idx on pots (owner);

-- Every Deposited / Withdrawn event
create table if not exists activity (
  tx_hash    text not null,
  log_index  int  not null,
  pot_id     bigint not null references pots(id),
  owner      text not null,
  type       text not null check (type in ('deposit','withdraw')),
  assets     numeric not null,               -- USDC integer units (6 dp)
  shares     numeric not null,               -- vault share units (the vault's own decimals)
  block      bigint not null,
  at         timestamptz not null,
  primary key (tx_hash, log_index)           -- makes re-indexing safe
);
create index if not exists activity_owner_block_idx on activity (owner, block desc);
create index if not exists activity_pot_block_idx on activity (pot_id, block desc);

-- Rate history for the Portfolios page and calculator context
create table if not exists vault_snapshots (
  at             timestamptz not null default now(),
  tier           text not null check (tier in ('calm','steady','bold')),
  vault          text not null,
  apy            numeric not null,           -- decimal: 0.0448 is 4.48%
  liquidity      numeric,                    -- USDC available to withdraw, as a decimal
  total_deposits numeric,
  status         text,
  primary key (at, tier)
);
create index if not exists vault_snapshots_tier_at_idx on vault_snapshots (tier, at desc);

-- Where the indexer left off (one row)
create table if not exists indexer_state (
  id          int primary key default 1 check (id = 1),
  last_block  bigint not null
);

alter table pots            enable row level security;
alter table activity        enable row level security;
alter table vault_snapshots enable row level security;
alter table indexer_state   enable row level security;

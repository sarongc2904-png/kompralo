-- Adds Quick Setup Wizard tracking columns to invitations.
-- wizard_step_completed: 0 = not started, 1-2 = in progress, 3 = done
-- ceremony_type / civil_already_done: captured in step 2 of the wizard

alter table public.invitations
  add column if not exists wizard_step_completed int not null default 0,
  add column if not exists ceremony_type text
    check (ceremony_type in ('solo_civil', 'civil_e_iglesia', 'solo_religiosa')),
  add column if not exists civil_already_done boolean not null default false;

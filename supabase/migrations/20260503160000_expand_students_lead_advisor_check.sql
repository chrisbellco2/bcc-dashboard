-- Restrict lead_advisor to the active consultant roster (drop + re-add if constraint already exists remotely).

update students
set lead_advisor = 'Chris'
where lead_advisor = 'Chris Bell';

alter table students
  drop constraint if exists students_lead_advisor_check;

alter table students
  add constraint students_lead_advisor_check
  check (
    lead_advisor in ('Chris', 'Gav', 'Mark', 'Laura', 'Esther')
  );

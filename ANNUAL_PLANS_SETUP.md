# Ishraq Annual Plans Update

This project copy includes the Annual Plans feature and removes Gallery from the public navigation.

## What changed

- Public navbar: Gallery removed, Annual Plans added.
- Footer: Gallery removed, Annual Plans added.
- Public routes:
  - `/annual-plans`
  - `/annual-plans/:id`
- Homepage: new Annual Plans preview section.
- Admin dashboard: new **Annual Plans** menu for Admin users.
- Admin can create, edit, publish/hide, delete annual plans and add/remove plan photos.
- Backend API added under `/api/annual-plans`.
- Database tables added:
  - `annual_plans`
  - `annual_plan_images`

## Existing database

If you already have the Ishraq database, run:

`database/migration_extras.sql`

This creates the Annual Plans tables without recreating the full database.

## Fresh database

For a new database, use:

`database/schema.sql`

## Annual Plan statuses

- Planned
- Upcoming
- Ongoing
- Completed

## Important

The public Annual Plans page includes sample fallback content until you publish real annual plans from the admin dashboard.

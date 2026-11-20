# London Movers

Responsive Next.js website with persistent quote enquiries, a protected content-management workspace and email notifications.

## Requirements

- Node.js 22.13 or later (uses the built-in `node:sqlite` module)
- npm

## Local setup

```powershell
npm install
Copy-Item .env.example .env.local
```

Set `ADMIN_EMAIL` and a long, unique `ADMIN_PASSWORD` in `.env.local` before opening `/admin`. The application does not create default administrator credentials. The SQLite database is created at `data/london-movers.sqlite` by default; set `DATABASE_PATH` to choose another persistent location.

For enquiry email delivery, configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `MAIL_FROM` and `ENQUIRY_TO` in the server environment. Without SMTP configuration, enquiries are still stored and receive a reference number, but email is not delivered.

Set `NEXT_PUBLIC_CONTACT_PHONE` and `NEXT_PUBLIC_CONTACT_EMAIL` only to verified business contact details. If unset, those details are omitted from the site.

```powershell
npm run dev
```

## Production

```powershell
npm run typecheck
npm run build
npm start
```

Set `NEXT_PUBLIC_SITE_URL` to the canonical production origin. Back up the SQLite database and deploy to a host with persistent local storage, or provide an appropriate persistent `DATABASE_PATH`. Do not commit `.env.local`, database files or credentials.

The public services, London regions, boroughs, neighbourhoods, FAQs, guides and keyword plan are seeded into the database on first use. Street and postcode collections start empty; add only verified records. SEO search-volume, difficulty, CPC and ranking metrics are intentionally unavailable unless verified research is supplied.

The website uses externally hosted editorial photography; replace it with approved, optimized business photography before launch. Reviews are not fabricated or displayed without verified source material and permission.

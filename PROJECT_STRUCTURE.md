# Ishraq Charity Organization Management System — Project Structure

This project is organized as a three-layer full-stack application: React client, Node/Express API, and MySQL database.

```text
ishraq-charity/
├── client/                         # React + Vite frontend
│   ├── src/
│   │   ├── api/                    # API client and file helpers
│   │   ├── components/             # Shared UI/layout components
│   │   ├── config/                 # Public configuration data
│   │   ├── context/                # Authentication context
│   │   ├── pages/
│   │   │   ├── public/             # Public website pages
│   │   │   └── dashboard/          # Staff/admin dashboard pages
│   │   ├── App.jsx                 # Application routes
│   │   ├── index.css               # Shared responsive styles
│   │   └── main.jsx                # React entry point
│   ├── .env
│   ├── package.json
│   └── vite.config.js
│
├── server/                         # Node.js + Express backend
│   ├── src/
│   │   ├── config/                 # Database/application config
│   │   ├── controllers/            # Request handlers/business flow
│   │   ├── middleware/             # Authentication/authorization/etc.
│   │   ├── models/                 # Data-access logic
│   │   ├── routes/                 # REST API routes
│   │   ├── services/               # Reusable business logic
│   │   ├── utils/                  # Shared helpers
│   │   └── validators/             # Input validation
│   ├── .env
│   ├── package.json
│   └── server.js
│
├── database/
│   ├── schema.sql                  # Main MySQL schema
│   └── migration_extras.sql        # Additional migrations
│
├── ANNUAL_PLANS_SETUP.md
├── PROJECT_STRUCTURE.md
└── UI_UPDATE_NOTES.md
```

## Public frontend structure

The public website uses a consistent responsive hierarchy:

1. Shared fixed navigation
2. Page hero/title area
3. Main content section
4. Reusable content/detail blocks
5. Footer

Annual Plans use a more formal report/document structure: organization identity, annual-plan heading, implementation record, measurable target, beneficiaries, duration, status, progress, and documented results.

## Responsive breakpoints

- Desktop: above 1100px
- Tablet / small desktop: 651px–1100px
- Mobile: 421px–650px
- Small mobile: up to 420px

The layouts intentionally change structure at these widths instead of only shrinking text.

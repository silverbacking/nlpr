# NLPR - NL Periodic Review Tracker

Compliance dashboard for tracking periodic reviews of regulated companies in the Netherlands. Built for SilverBacking Trust B.V.

## Tech Stack

- **Frontend:** React + Vite + TypeScript + Tailwind CSS
- **Backend:** Cloudflare Workers (Pages Functions)
- **Database:** Cloudflare D1 (SQLite) for user management
- **Charts:** Recharts
- **Icons:** Lucide React
- **Excel:** SheetJS (xlsx)

## Features

- **Dashboard** with KPI cards, regulation/risk charts, alerts, and activity feed
- **Client Table** with search, filter, sort, and pagination
- **Client Detail** view with all fields, workflow timeline, and email history
- **Simulated Inbox/Outbox** with realistic compliance email templates
- **PR Workflow** kanban board showing review pipeline stages
- **User Management** admin panel with role toggling
- **Excel Import/Export** for client data
- **JWT Authentication** with demo credentials

## Getting Started

```bash
npm install
npm run dev
```

## Demo Credentials

- **Admin:** admin@silverbacking.com / admin123
- **Reviewer:** reviewer@silverbacking.com / reviewer123

## Upload Data

After logging in, click "Upload Excel" in the sidebar to import the `sample-data.xlsx` file. The dashboard will populate with data from the Clients sheet.

## Deploy to Cloudflare Pages

1. Create a D1 database:
   ```bash
   wrangler d1 create nlpr-db
   ```
2. Update `wrangler.toml` with the database ID
3. Run the schema:
   ```bash
   wrangler d1 execute nlpr-db --file=d1/schema.sql
   ```
4. Deploy:
   ```bash
   npm run build
   wrangler pages deploy dist
   ```

## Project Structure

```
src/
├── components/Layout.tsx    # Sidebar navigation and app shell
├── pages/
│   ├── Dashboard.tsx        # KPIs, charts, alerts, activity
│   ├── ClientsTable.tsx     # Searchable/sortable client table
│   ├── ClientDetail.tsx     # Individual client view
│   ├── Inbox.tsx            # Simulated email inbox/outbox
│   ├── Workflow.tsx         # Kanban PR pipeline
│   ├── Login.tsx            # Authentication
│   └── AdminPanel.tsx       # User management
├── utils/
│   ├── parseExcel.ts        # Excel import/export
│   ├── simulateData.ts      # KPIs, alerts, emails, activities
│   └── auth.ts              # Auth helpers
├── types/index.ts           # TypeScript types
└── App.tsx                  # Router and state management

functions/api/               # Cloudflare Workers (auth only)
d1/schema.sql               # D1 database schema
```

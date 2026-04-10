# DuckNest 🦆

A cozy, duck-themed shared space for partners. Date planning, memories, shopping lists & chores — all in one private little nest.

## Features

- **Nest (Home)** — Mood sync between partners, love meter, days-together countdown
- **Date Planner** — Browse and plan dates by category, track completed dates with photos & notes
- **Memories** — Auto-generated memory blog from completed dates
- **Shopping Lists** — Shared and individual shopping lists with real-time tabs
- **Chores** — Assign and track household chores together
- **Profiles** — Display names, partner nicknames, invite system, and privacy controls
- **Solo-first** — Works immediately after signup; invite your partner when ready

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 3.4 with custom duck/amber theme
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Storage:** localStorage (no backend required)

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Project Structure

```
src/
├── app/            # Next.js App Router pages
├── components/     # All UI components
├── hooks/          # useAppData (global context) & useLocalStorage
├── lib/            # Utilities and seed data
└── types/          # TypeScript type definitions
```

## Deploy on Vercel

The easiest way to deploy is with [Vercel](https://vercel.com/new):

1. Push this repo to GitHub
2. Import the repository on Vercel
3. Deploy — no environment variables needed

## License

Private project.

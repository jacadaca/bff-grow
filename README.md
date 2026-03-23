# BFF Growth Chart

Interactive ecommerce revenue intelligence dashboard built with React + Recharts.

---

## Quick Start (Local)

```bash
# 1. Install dependencies
npm install

# 2. Run dev server
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173) in Chrome.

Passcode: `bff26!`

---

## Project Structure

```
bff-growth-chart/
├── index.html                    # HTML entry point
├── vite.config.js                # Vite config
├── vercel.json                   # Vercel deployment config
├── package.json
└── src/
    ├── main.jsx                  # React root mount
    └── AcadacaGrowthChart.jsx    # Main chart component (~3,650 lines)
```

---

## Deploy to Vercel

### Option A — Vercel CLI (fastest)

```bash
npm install -g vercel
vercel
```

Follow the prompts. Vercel auto-detects Vite.

### Option B — GitHub + Vercel Dashboard

1. Push this repo to GitHub (see below)
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your GitHub repo
4. Vercel auto-detects Vite — just click **Deploy**

---

## Push to GitHub

```bash
# Inside the project folder:
git init
git add .
git commit -m "Initial commit — BFF Growth Chart v59"

# Create a new repo on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/bff-growth-chart.git
git branch -M main
git push -u origin main
```

---

## Build for Production

```bash
npm run build
# Output goes to /dist — ready to deploy anywhere static
```

---

## Key Notes

- **Recharts is pinned to 2.15.3** — do NOT upgrade to v3.x. The `Customized` component API changed in v3 and breaks all the shaded polygon fills.
- The chart is fully self-contained in a single JSX file — no external API calls, no backend needed.
- All data is generated client-side via `generateData()`.

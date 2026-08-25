# NutriLens 🔬

AI-powered sports nutrition research platform. Aggregates reviews, cross-references ingredients with peer-reviewed science, and generates personalised recommendations.

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Add your API key
```bash
cp .env.example .env.local
```
Open `.env.local` and set:
```
ANTHROPIC_API_KEY=your_key_here
```
Get a key at https://console.anthropic.com

### 3. Run locally
```bash
npm run dev
```
Open http://localhost:3000

---

## Deploy to Vercel (recommended)

1. Push this folder to a GitHub repo
2. Go to https://vercel.com → "Add New Project" → import your repo
3. Add environment variable: `ANTHROPIC_API_KEY`
4. Click Deploy — live in ~2 minutes

---

## Project Structure

```
nutrilens/
├── app/
│   ├── page.tsx              # Home / product browse
│   ├── report/[id]/page.tsx  # Product report page
│   ├── quiz/page.tsx         # Personalisation quiz
│   ├── api/
│   │   ├── summarize/        # AI summary endpoint
│   │   └── rank/             # AI ranking endpoint
│   ├── layout.tsx
│   └── globals.css
├── lib/
│   └── products.ts           # Product data & types
├── .env.example
└── README.md
```

## Adding More Products

Edit `lib/products.ts` and add entries to the `PRODUCTS` array following the existing structure. In production, replace this with a database (Supabase recommended).

## Adding Real Reviews (Next Steps)

- **Reddit**: Register app at reddit.com/prefs/apps, use the Reddit API
- **Amazon**: Use Rainforest API (~$50/mo) for legal scraping
- **Trustpilot**: Official API for business listings


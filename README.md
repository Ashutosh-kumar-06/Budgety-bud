# PocketBuddy 🎓💰🧠

> AI-Powered Financial & Wellness Assistant for College Students

PocketBuddy combines **personal finance management** with **mental & emotional wellness support**, helping students aged 18–30 manage money and well-being in tandem.

## Features

### 💰 Finance
- **Expense Tracking** — Manual entry or bank sync (Plaid)
- **Budget Planning** — Set monthly limits per category with visual progress
- **Analytics** — Spending trends, category breakdowns, income vs expenses
- **Smart Deals** — Student discounts, cheap eats, travel deals

### 🧠 Wellness
- **AI Chat Coach** — NLP chatbot for financial advice & emotional support
- **Habit Tracking** — Sleep, exercise, study, mood with streaks & gamification
- **Burnout Detection** — Mood surveys & pattern detection
- **Campus Resources** — Counseling centers, food pantries, student clubs

### 🤖 AI (Provider-Agnostic)
- Swappable AI backend: **OpenAI**, **Anthropic Claude**, **Google Gemini**
- Configure via `AI_PROVIDER` environment variable
- Strategy pattern — add new providers without changing business logic

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite, Recharts, Lucide |
| Backend | Express 5, TypeScript, Mongoose |
| Database | MongoDB Atlas |
| Auth | JWT (jose library), bcryptjs |
| AI | OpenAI / Anthropic / Gemini (swappable) |
| Deployment | AWS (ECS/EB + S3/CloudFront) |
| Styling | Vanilla CSS with CSS Custom Properties |

## Project Structure

```
pocketbuudy/
├── client/          # React frontend (Vite + TypeScript)
│   └── src/
│       ├── components/   # Reusable UI components
│       ├── pages/        # Page components
│       ├── context/      # React contexts (auth, theme, toast)
│       ├── hooks/        # Custom hooks
│       ├── services/     # API service layer
│       ├── styles/       # Global CSS & design system
│       ├── types/        # TypeScript interfaces
│       └── utils/        # Helper functions
├── server/          # Express backend (TypeScript)
│   └── src/
│       ├── config/       # DB, env configuration
│       ├── controllers/  # Request handlers
│       ├── middleware/    # Auth, validation, error handling
│       ├── models/       # Mongoose schemas
│       ├── routes/       # API route definitions
│       ├── services/     # Business logic & AI abstraction
│       │   └── ai/       # Provider-agnostic AI layer
│       │       ├── providers/  # OpenAI, Anthropic, Gemini adapters
│       │       ├── factory.ts  # Provider factory
│       │       └── types.ts    # AI interfaces
│       ├── seeds/        # Sample data
│       └── types/        # Shared TypeScript types
├── docker/          # Docker configs
├── .env.example     # Environment variable template
└── package.json     # Root orchestration
```

## Quick Start

### Prerequisites
- Node.js 20+
- MongoDB (local or Atlas)
- API key for your AI provider (OpenAI, Anthropic, or Gemini)

### Setup

```bash
# 1. Clone & install
git clone <repo-url>
cd pocketbuudy
npm install
cd client && npm install && cd ..
cd server && npm install && cd ..

# 2. Configure environment
cp .env.example .env
# Edit .env with your MongoDB URI, JWT secrets, AI API key

# 3. Run development
npm run dev
# Client: http://localhost:5173
# Server: http://localhost:5000
```

### Environment Variables

See `.env.example` for all options. Key ones:

| Variable | Description |
|----------|-----------|
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret for signing JWT tokens |
| `AI_PROVIDER` | `openai`, `anthropic`, or `gemini` |
| `OPENAI_API_KEY` | OpenAI API key (if using OpenAI) |
| `ANTHROPIC_API_KEY` | Anthropic key (if using Anthropic) |
| `GEMINI_API_KEY` | Gemini key (if using Gemini) |

## Design System — "Growth & Calm"

- **Primary**: Emerald Green (#10B981) — financial growth
- **Secondary**: Teal (#14B8A6) — wellness calm
- **Accent**: Gold (#FFC960) — rewards & CTAs
- **Typography**: Space Grotesk (headings) + Inter (body)
- **Theme**: Dark mode first, with light mode toggle
- **Effects**: Glassmorphism, gradient text, micro-animations

## AWS Deployment

See `docker/` for Docker configs. Deployment options:

- **Backend**: ECS Fargate or Elastic Beanstalk
- **Frontend**: S3 + CloudFront CDN
- **Database**: MongoDB Atlas (multi-region)
- **CI/CD**: GitHub Actions → AWS

## License

MIT

# TasteMatch

> **Find the cultural overlap between two people.**

TasteMatch is an AI-powered cultural compatibility agent built for the **Qloo LLM Hackathon**. Give it two people's tastes in natural language — it uses **Qloo's Taste AI™** to discover the hidden cultural relationships between their preferences, then creates a shared recommendation neither person would have thought of alone.

---

## What it does

1. You describe what two people love — films, music, food, places, brands — in plain natural language.
2. **Agent 1 (Taste Parser)** extracts structured cultural entities using Gemini.
3. **Agent 2 (Qloo Explorer)** resolves each entity against Qloo's knowledge graph and pulls cross-domain taste affinities.
4. **Agent 3 (Cultural Matchmaker)** identifies shared cultural territory — the hidden aesthetic bridge connecting both profiles.
5. **Agent 4 (Experience Planner)** creates a concrete, location-aware shared experience with an unexpected recommendation neither person asked for.

---

## Why Qloo is essential

TasteMatch would not work nearly as well using an LLM alone.

Generic LLMs can recognize that someone likes *Interstellar* and someone else likes *Dune* and conclude "they both like sci-fi." That's surface-level.

Qloo's Taste AI™ surfaces the **behavioral cultural graph** underneath: that fans of both films skew toward *atmospheric, immersive experiences*, *experimental sound design*, and *sophisticated dining* — cross-domain affinities derived from 10 trillion anonymized behavioral signals across music, film, food, fashion, and travel.

The "Cultural Bridge" and "Unexpected Match" features exist entirely because of Qloo data. Without it, the recommendations collapse to generic LLM guesses.

---

## Architecture

```mermaid
graph TD
    A[Natural language input] --> B[Agent 1: Taste Parser\nGemini extracts entities]
    B --> C[Agent 2: Qloo Explorer]
    C --> D[/search — resolve entity IDs]
    C --> E[/v2/insights — taste fingerprints]
    C --> F[Cross-domain affinities]
    D & E & F --> G[Shared taste territory]
    G --> H[Agent 3: Cultural Matchmaker\nBuilds Cultural Bridge]
    H --> I[Agent 4: Experience Planner\nGemini reasons over Qloo data]
    I --> J[Results: Bridge + Unexpected Match + Plan]
```

---

## Agent workflow

| Agent | Role | APIs used |
|-------|------|-----------|
| Taste Parser | Natural language → structured entities | Gemini 1.5 Flash |
| Qloo Explorer | Entity resolution + cultural fingerprint | Qloo `/search`, `/v2/insights` |
| Cultural Matchmaker | Find shared cultural territory | Gemini (reasoned over Qloo data) |
| Experience Planner | Concrete plan + unexpected recommendation | Gemini (grounded in Qloo results) |

---

## Qloo integration

| Endpoint | Purpose |
|----------|---------|
| `GET /search` | Resolve entity names (movies, artists, brands) to Qloo IDs |
| `GET /v2/insights` | Get taste-based recommendations per domain (`urn:entity:movie`, `urn:entity:artist`, `urn:entity:place`, `urn:entity:brand`) |

Key implementation detail: we call `/v2/insights` **multiple times per person** across different `filter.type` values to build a cross-domain taste fingerprint, then run a combined query with both people's entity IDs to find bridge recommendations.

The Qloo results are stored in agent state and fed directly into the LLM prompts — the LLM reasons **over** Qloo data, not instead of it.

---

## Setup

### Prerequisites

- Node.js 18+
- A [Qloo Hackathon API key](https://docs.qloo.com/reference/qloo-llm-hackathon-developer-guide#getting-your-api-key)
- A [Google Gemini API key](https://aistudio.google.com/app/apikey)

### Install

```bash
git clone https://github.com/your-username/tastematch
cd tastematch
npm install
```

### Environment variables

Copy `.env.example` to `.env.local` and fill in:

```env
QLOO_API_KEY=hack_your_key_here
GEMINI_API_KEY=your_gemini_key_here
```

**Important:** The Qloo hackathon key only works against `https://hackathon.api.qloo.com`. Do not use staging or production URLs.

---

## Running locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deployment

Optimised for Vercel. Set the two environment variables in your Vercel project settings, then:

```bash
vercel deploy
```

Or connect the GitHub repo and Vercel will auto-deploy on push.

---

## Example

**Person A:** "I love Interstellar, A.R. Rahman, Japanese food, Nike sneakers, quiet cafés."

**Person B:** "I love Dune, The Weeknd, Italian food, vintage clothing, live music."

**Qloo discovers:** Both profiles have strong affinity toward *atmospheric, cinematic experiences* and *experimental sound* — connections that cross the film/music/food boundary.

**Cultural Bridge:** Cinematic grandeur · Atmospheric immersion · Experimental sound · Sophisticated dining

**Unexpected Match:** An intimate jazz bar with ambient lighting and a curated cocktail menu — something neither person asked for, but that sits precisely at the intersection of both cultural profiles.

---

## Hackathon submission

Built for the **Qloo LLM Hackathon**.

- **Does it clearly use Qloo?** Yes — `/search` and `/v2/insights` are called for every analysis, and results are stored in agent state.
- **Would this be worse without Qloo?** Substantially. The Cultural Bridge and Unexpected Match are derived from Qloo's cross-domain behavioral graph, not LLM pattern-matching.
- **Is the agent doing something intelligent?** Yes — a 4-agent pipeline with Qloo data flowing through each stage.
- **Can a judge understand the value in 30 seconds?** The demo mode and "Qloo Discovered" section make the value visible immediately.

---

## License

MIT — see [LICENSE](./LICENSE)

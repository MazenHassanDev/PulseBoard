# Engineering Take-Home
## PulseBoard — Campaign Performance Tracker
*Full-stack build · ~1 week · Submit a live URL, a repo, and a short writeup*

---

## The Brief

Build PulseBoard: a small internal tool that a marketing agency would use to track ad-campaign performance across clients. The goal is a working, deployed product — not a perfect one. We care far more about how you think, how you make tradeoffs, and how you use AI as part of your workflow than about pixel-perfect UI.

A user should be able to log in, add campaign data (manually and via CSV upload), and see a dashboard that computes and ranks campaign performance. One feature uses an LLM to explain, in plain English, why a given campaign is performing the way it is.

---

## What to Build

### Authentication
- Basic login — email + password, or a magic link
- It doesn't need to be bulletproof, but each user must only see their own data

### Backend & Database
- Use a real database (Supabase, Postgres, SQLite — your choice)
- Campaign data must persist between sessions

### Data Entry
- Let users add campaigns manually through a form
- Let users bulk-import campaigns via CSV upload (a sample CSV is provided)
- Each campaign has: name, platform, spend, impressions, clicks, conversions, and revenue

### Dashboard
- A list view of campaigns with computed metrics: CTR, CPC, and ROAS
- Sortable and filterable (at minimum, filter by platform)
- At least one chart visualizing performance

### AI Explainer
- For any campaign, a button that calls an LLM and returns a short, plain-English explanation of why that campaign is performing well or poorly
- The explanation should be specific to that campaign's actual numbers

### Deployment & Delivery
- Deploy to a live URL (Netlify, Vercel, Render, etc.) and protect it with a password
- Any simple method is fine — site-level password protection, deployment protection, or a basic access gate
- Share the URL and the password
- Send code as a ZIP file — include the .git folder (version history) inside the ZIP
- Include a clear README covering setup steps and key decisions

---

## Suggested Pacing

| Days | Focus |
|---|---|
| Days 1–2 | Foundation: auth, database schema, and a deployed hello-world. Get the skeleton standing early. |
| Days 3–4 | Data entry, CSV import with validation, metric computation, the list view and a chart. |
| Day 5 | The AI explainer. |
| Days 6–7 | Edge cases, README, writeup, and packaging the ZIP. |

*This is a guide, not a requirement — organize the week however works best for you.*

---

## What to Submit

- The password-protected live URL of the deployed app, along with the password
- A ZIP file of the code with the .git version history included
- A short writeup (~400 words) covering:
  - How you approached the problem and how you scoped your week
  - Which AI tools you used, what you used them for, and where you chose not to rely on them
  - The main tradeoffs you made, and what you'd improve with more time

---

## How We'll Evaluate It

- A working product
- Clean and readable code
- Sensible handling of real-world data
- Clear reasoning
- The AI explainer is a chance to show how you think about building with LLMs — not just calling one, but grounding it so the output is accurate and useful
- After submission there will be a short call to walk through the code and decisions — be ready to explain any part of it

*Use whatever stack, tools, and AI assistants you like. We want to see how you actually work.*

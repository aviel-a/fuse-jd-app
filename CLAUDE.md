# FUSE JD Generator — Project Briefing

## What is this?
A web app that generates job descriptions for **FUSE**, a defense-tech startup (subsidiary of Elbit Systems) that builds autonomous and robotic platforms for man-unmanned teaming (MUM-T). Based in Rosh HaAyin, Israel.

The app is built with **Next.js**, deployed on **Vercel**, and uses the **Anthropic API** (Claude) to generate JD content.

---

## Live URL
https://fuse-jd-app.vercel.app

## GitHub Repo
https://github.com/aviel-a/fuse-jd-app

---

## File Structure
```
fuse-jd-app/
├── pages/
│   ├── index.js          ← Main UI + all logic (React)
│   ├── view.js           ← Standalone share viewer page (print-friendly)
│   └── api/
│       └── anthropic.js  ← Server-side API proxy (hides the API key)
├── public/               ← Static assets (empty for now)
├── next.config.js        ← Exposes git commit count as NEXT_PUBLIC_VERSION
├── package.json          ← Dependencies (Next.js 14, React 18)
└── CLAUDE.md             ← This file
```

---

## How it Works

### User flow
1. User fills in: Job Title, Level, Team, Location, optional notes
2. Clicks "Generate Job Description"
3. App calls `/api/anthropic` (server-side proxy)
4. Claude AI generates: roleIntro, responsibilities, requirements, preferredQuals
5. A **preview modal** pops up immediately — no scrolling needed
6. Inside the modal, user can:
   - **Delete** individual bullet lines (× button on each line)
   - **Refine** — type a natural-language instruction and re-run the AI
   - **Download** the `.docx` file (built client-side, no server)
   - **Share** — opens a clean print-friendly viewer page in a new tab (`/view?data=...`)
7. Share page (`pages/view.js`) has a "Print / Save PDF" button

### API flow
```
Browser → /api/anthropic (Vercel server) → Anthropic API → Claude AI
```
The API key lives only on the Vercel server as environment variable `ANTHROPIC_API_KEY`. Never exposed to the browser.

---

## Brand & Design

### Colors
- **Primary accent:** `#F5C400` (FUSE yellow)
- **Background:** `#0a0f0e` (near black)
- **Card:** `#111918`
- **Border:** `#1e2e2c`
- **Muted text:** `#4a6663`

### Logo
Yellow 8-point star SVG in the header, matching the FUSE brand mark.

### Typography
- Headers: Syne 800
- Body: Inter 300/400/500
- Mono labels: DM Mono

---

## FUSE Voice & JD Structure (IMPORTANT)

Every generated JD must follow this exact structure:

1. **Role title** (yellow, large)
2. **Teal rule** (horizontal line)
3. **Metadata** (location | team | job number)
4. **Mission hook** (fixed boilerplate, always the same):
   > "Let's make an impact on tomorrow's battlefield."
   > "FUSE is where cutting-edge defense technology meets real-world impact."
   > "We're redefining man unmanned teaming (MUM-T)..."
5. **"We are looking for"** + role intro paragraph
6. **"In this role you will"** + bullet responsibilities
7. **"Requirements"** + bullet list (nice-to-haves end with "– advantage")
8. **"Preferred qualifications"** (optional section)
9. **Sign-off** (fixed boilerplate):
   > "This is your chance to be a part of a new and exciting opportunity..."
   > "If you're looking to move fast, think big..."
10. **Footer**: "Only relevant applications will be answered**" + "Rosh HaAyin#"

### Tone rules
- Bold, direct, human — no corporate fluff
- Short sentences, active verbs
- No passive voice
- Responsibilities: bare infinitive verbs (Design, Lead, Develop...)
- Nice-to-haves always end with "– advantage"

---

## Deployment

- **Platform:** Vercel (free tier)
- **Auto-deploy:** every push to `main` branch triggers a redeploy
- **Environment variable:** `ANTHROPIC_API_KEY` set in Vercel dashboard
- **Model:** `claude-sonnet-4-5`

### To deploy a change:
```bash
git add .
git commit -m "describe your change"
git push
```
Vercel deploys automatically in ~30 seconds.

---

## Version Display
- The app header shows a version number (e.g. `v12`) derived from the total git commit count
- Implemented in `next.config.js` via `git rev-list --count HEAD` at build time
- Automatically increments by 1 with every push — no manual versioning needed
- Shows `dev` when running locally without git

---

## Current Limitations
- No web search (removed to stay within free API tier token limits)
- No authentication (app is public — anyone with the URL can use it)
- No usage tracking
- Share links encode full JD state in the URL (no backend storage) — URLs are long but functional

---

## Common Change Requests & Where to Make Them

| Change | File | What to edit |
|---|---|---|
| UI colors / layout | `pages/index.js` | Color constants at top |
| Add/remove form fields | `pages/index.js` | State + JSX form section |
| Change AI prompt / JD structure | `pages/index.js` | `generateWithAI()` function |
| Change AI refinement prompt | `pages/index.js` | `refineWithAI()` function |
| Change .docx styling | `pages/index.js` | `generateDocx()` function |
| Change preview modal layout | `pages/index.js` | `{showPreview&&(...)}` JSX block |
| Change preview content/styling | `pages/index.js` | `JDPreview` component |
| Change share viewer styling | `pages/view.js` | Full file |
| Change version display | `next.config.js` | `NEXT_PUBLIC_VERSION` env logic |
| Add new API features | `pages/api/anthropic.js` | Proxy handler |
| Re-enable web search | `pages/index.js` | Add back `searchSimilarJobs()` + tools array |

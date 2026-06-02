# FUSE JD Generator — Project Briefing

## What is this?
A web app that generates job descriptions for **FUSE**, a defense-tech startup (subsidiary of Elbit Systems) that builds autonomous and robotic platforms for man-unmanned teaming (MUM-T). Based in Rosh HaAyin, Israel.

The app is built with **Next.js**, deployed on **Vercel**, and uses the **Anthropic API** (Claude) to generate JD content.

---

## Live URL
https://fuse-jd-app.vercel.app

## GitHub Repo
https://github.com/YOUR_USERNAME/fuse-jd-app

---

## File Structure
```
fuse-jd-app/
├── pages/
│   ├── index.js          ← Main UI + all logic (React)
│   └── api/
│       └── anthropic.js  ← Server-side API proxy (hides the API key)
├── public/               ← Static assets (empty for now)
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
5. Browser builds a `.docx` file (pure JS, no server)
6. User downloads the Word file

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

## Current Limitations
- No web search (removed to stay within free API tier token limits)
- No authentication (app is public — anyone with the URL can use it)
- No usage tracking

---

## Common Change Requests & Where to Make Them

| Change | File | What to edit |
|---|---|---|
| UI colors / layout | `pages/index.js` | Color constants at top |
| Add/remove form fields | `pages/index.js` | State + JSX form section |
| Change AI prompt / JD structure | `pages/index.js` | `generateWithAI()` function |
| Change .docx styling | `pages/index.js` | `generateDocx()` function |
| Add new API features | `pages/api/anthropic.js` | Proxy handler |
| Re-enable web search | `pages/index.js` | Add back `searchSimilarJobs()` + tools array |

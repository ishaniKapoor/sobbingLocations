# sobbingLocations

A lightweight, Vercel-ready static site for sharing your cries with friends.

## What's included

- **Feed tab** with a Strava-style cry log (photo, description, duration, reason).
- **Map tab** that pins cry locations using latitude/longitude.
- **Profiles tab** to create your profile and add friends.
- Data persists in `localStorage` so everything stays in your browser.

## Running locally

Open `index.html` directly in your browser or serve the folder:

```bash
python3 -m http.server
```

Then visit `http://localhost:8000`.

## Deploying to Vercel

1. Push this repo to GitHub.
2. Import it in Vercel.
3. Framework preset: **Other** (static site).
4. Build command: _none_.
5. Output directory: `.`

Vercel will serve the `index.html` file as the entry point.

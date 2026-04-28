# PlateScan

PlateScan is a mobile-friendly web app that uses your phone camera to scan meals, estimate calories, and show nutrition facts.

## Features

- Camera-based meal capture (rear camera preferred)
- Optional Google Cloud Vision detection for stronger meal recognition
- On-device image classification using MobileNet (TensorFlow.js via CDN) as fallback
- Estimated calories, protein, carbs, fat, fiber, and sodium
- Scan history stored in local browser storage
- Daily totals dashboard with configurable calorie and macro goals
- Weekly 7-day trends chart for calories and scan count
- Weekly trend metric switcher (calories, protein, carbs, fat, or scan count)
- Responsive interface for mobile and desktop

## How It Works

1. Start camera and capture meal photo.
2. Detection runs with Google Cloud Vision (if enabled and key is set), else local model.
3. Predictions are mapped to meal categories.
4. Nutrition is estimated from a reference profile and serving estimate.
5. Result is saved to history and included in daily totals and weekly trends.

## Run Locally

Because camera access needs a secure context, use one of these options:

- Open via localhost with a simple server (recommended)
- Use a VS Code static server extension

If Python is installed:

```bash
cd platescan
python -m http.server 8080
```

Then open:

http://localhost:8080

## Deploy to Cloudflare Pages

1. Push this repo to GitHub.
2. In Cloudflare Dashboard, go to Workers & Pages -> Create application -> Pages -> Connect to Git.
3. Select this repository.
4. Build settings:
	- Framework preset: None
	- Build command: (leave empty)
	- Build output directory: /
5. Deploy.

This repository includes a root `_headers` file used by Cloudflare Pages for security and cache headers, including camera permissions for the scanner. App and stylesheet files are set to revalidate to avoid stale-client issues after updates.

## Google Cloud Vision Setup (Optional)

1. Create a Google Cloud project and enable Vision API.
2. Create an API key with HTTP referrer restrictions.
3. In the app, turn on "Use Google Cloud Vision" and paste your key.
4. Tap "Save Key".

If cloud detection fails, the app automatically falls back to local AI detection.

## Notes

- Nutrition values are estimates and not medical-grade measurements.
- Cloud API keys in browser apps should always use strict referrer restrictions.
- Detection quality still depends on meal angle, lighting, and image quality.
- History is saved per browser/device in localStorage.

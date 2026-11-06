# Pickleball Scorer - Official Website

A high-performance, fully responsive marketing, documentation, and pricing website for the **Pickleball Scorer** Android application.

Built with **pure Bootstrap 5.3.3**, modern CSS custom properties, and lightweight vanilla JavaScript.

---

## 📁 Standard Project Structure

```text
website/
├── index.html              # Main semantic HTML5 webpage with all sections
├── css/
│   └── styles.css          # Design system variables, dark/light theme tokens, animations
├── js/
│   └── main.js             # Splash loader, interactive score simulator, theme switcher, modal checkout
├── assets/
│   └── images/
│       ├── logo.png        # Official app icon (PNG)
│       ├── hero.jpg        # 16:9 3D tournament court & phone mockup
│       └── features.jpg    # 4:3 Referee tablet on-court action mockup
├── PickleballScorer-release.apk # Production-ready APK for direct visitor download
└── README.md               # Documentation & customization guide
```

---

## 🚀 Key Features

1. **Splash Screen Loading Transition**:
   - Identical to the mobile app's splash sequence with glowing bouncing pickleball ball, ripple ring, and loading progress bar.
   - Smoothly fades into the site once loaded.
   - Includes a floating **Replay** button at the bottom-right so visitors or presenters can re-trigger the splash animation anytime.

2. **Interactive Live Scoreboard Simulator Widget**:
   - Visitors can click **Serving Point (+1)** or **Fault / Side-Out** right in their desktop or mobile browser.
   - Automatically computes official doubles 3-number callout sequences (e.g. `0-0-2` -> `1-0-2` -> Side Out to `0-1-1`).
   - Dynamically highlights Right (Even) vs Left (Odd) court rules.

3. **Step-by-Step User Guide**:
   - Clear visual breakdown of 5 core match phases: Match Setup, Opening Serve, Scoring Points, Timeouts & Side Switches, and Concluding & Exporting.

4. **Official Rules Cheat Sheet**:
   - Covers the Non-Volley Zone (The Kitchen), Two-Bounce Rule, Even/Odd service court positioning, and 0-0-2 start.

5. **Pricing & Purchase Section**:
   - **Community Free** ($0)
   - **Pro Scorekeeper License** ($4.99 one-time payment)
   - **Club & Tournament License** ($19.99 lifetime)
   - Interactive checkout modal with instant sample 16-character license key generation.

6. **Dark / Light High-Contrast Themes**:
   - Instant toggle button in the navbar persisted in `localStorage`.
   - Adheres to WCAG contrast standards for bright outdoor sunlight and low-light gym conditions.

---

## 🛠️ How to Customize & Modify

### 1. Update Pricing or Payment Links
Open `index.html` and search for `#pricing`. Update plan amounts, feature bullets, or connect your real **Stripe Payment Link**, **PayPal**, or **LemonSqueezy** URL to the buttons:
```html
<a href="https://buy.stripe.com/your-custom-link" class="btn btn-neon w-100">
  Purchase Pro License ($4.99)
</a>
```

### 2. Update Colors & Theming
Open `css/styles.css` to adjust the design system CSS variables in `:root`:
```css
--neon-lime: #ccff00;
--neon-cyan: #00e5ff;
--neon-orange: #ff6d00;
--court-navy: #0b1528;
```

### 3. Replace or Add Images
Place your images inside `assets/images/` and update references in `index.html`.

---

## 🌐 How to Deploy for Free

### Option A: GitHub Pages
1. Push this folder to a GitHub repository.
2. In your repo settings, go to **Pages** > **Branch** > Select `main` and root (or `/docs`).
3. Your site goes live instantly at `https://<username>.github.io/<repo-name>`.

### Option B: Netlify or Vercel
1. Drag and drop the `website` folder into [Netlify Drop](https://app.netlify.com/drop).
2. Or run `npx vercel` inside the `website` directory.

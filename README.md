# Smart Stadium & Tournament Operations — FIFA World Cup 2026

A comprehensive, production-grade GenAI-enabled platform designed to enhance stadium operations, safety, and the fan experience for the FIFA World Cup 2026. Built as a unified React application with Firebase and Gemini AI.

## 1. Project Overview & Architecture

The Smart Stadium platform is a centralized operational hub and fan-facing portal. It aggregates simulated real-time data across crowd density, transport logistics, and environmental metrics, piping this data through Google's Gemini AI to generate actionable insights, predictive alerts, and natural language assistance.

**Architecture:**
- **Frontend:** React + Vite + TypeScript (Client-side rendering for responsiveness).
- **Backend/Database:** Firebase (Auth, Firestore for rules/metadata, Hosting).
- **AI Engine:** Google Gemini API (integrated directly via a secure client-side proxy layer with caching and rate limiting).
- **Styling:** Vanilla CSS with custom design tokens, dark mode glassmorphism, and WCAG AA compliance.

## 2. Problem Statement Alignment

This project directly addresses the hackathon's "Smart Stadium & Tournament Operations" problem statement by implementing all 6 required modules. (Search the codebase for `// PROBLEM STATEMENT ALIGNMENT` to see the exact implementation points).

| Module | Location | Description |
| :--- | :--- | :--- |
| **A. Dynamic Crowd Management** | `src/modules/crowd-management/` | Live density bars, AI congestion forecasting 10-15 mins ahead, and automated rerouting suggestions. |
| **B. Smart Indoor Navigation** | `src/modules/navigation/` | Graph-based pathfinding combined with a Gemini intent parser for natural language turn-by-turn routing. |
| **C. Control Room Copilot** | `src/modules/control-room/` | Staff-only dashboard that scores incident severity and uses AI to generate summaries and action plans. |
| **D. Multilingual Assistance** | `src/modules/chatbot/` | Fan-facing chat that auto-detects 5 languages (EN, ES, PT, FR, AR) and responds accordingly. |
| **E. Sustainability & Transport** | `src/modules/sustainability-transport/`| Tracks carbon/waste metrics and generates AI tips, plus predicts shuttle/parking loads with AI routing. |
| **F. Operational Intelligence** | `src/modules/operations-summary/` | Aggregates all system data into a single, AI-generated "Morning Briefing" for stadium managers. |

## 3. Technology Stack

- **Framework:** React 18, Vite
- **Language:** TypeScript
- **Styling:** Vanilla CSS
- **Database/Auth/Hosting:** Google Firebase
- **AI/ML:** Google Gemini (Generative Language API)
- **Accessibility:** axe-core (Automated testing in dev)

## 4. Setup & Local Development

1. **Clone the repository.**
2. **Install dependencies:**
   ```bash
   npm install --legacy-peer-deps
   ```
3. **Configure Environment:**
   Create a `.env.local` file in the root directory:
   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```
4. **Start Development Server:**
   ```bash
   npm run dev
   ```

## 5. Firebase & Staff Access Setup

This project uses a dedicated Firebase project (`smart-stadium-wc2026`).

### Configuring Firebase
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Initialize (if not already): `firebase init`
4. Deploy Rules: `firebase deploy --only firestore:rules`

### Staff Access Setup (Crucial for Control Room)
The Control Room Copilot is restricted to users with the `staff` custom claim. To grant yourself access:
1. Create a normal user account in the app via the Login page (or Google Sign-In).
2. Note the user's email address.
3. Ensure you have a Firebase Service Account key saved as `serviceAccountKey.json` in the project root.
4. Set the environment variable:
   - Windows: `$env:GOOGLE_APPLICATION_CREDENTIALS="C:\path\to\serviceAccountKey.json"`
   - Mac/Linux: `export GOOGLE_APPLICATION_CREDENTIALS="/path/to/serviceAccountKey.json"`
5. Run the admin script:
   ```bash
   node scripts/setStaffClaim.mjs "your.email@example.com"
   ```
6. Log out and log back in to the app to refresh your token. You can now access the Control Room and Operations modules.

## 6. Code Quality & Modularity

- **Separation of Concerns:** Business logic (pure functions, AI processing, data simulation) is strictly separated from UI components.
- **Shared Infrastructure:** Core utilities like the Gemini client, cache, validators, and i18n are centralized in `src/shared/`.
- **TypeScript:** Strict typing (`tsconfig.json` strict mode) prevents runtime errors.

## 7. Security Measures

See [`SECURITY.md`](./SECURITY.md) for full details. Highlights include:
- Firestore strict Role-Based Access Control (RBAC).
- Gemini prompt injection protection, input sanitization, and client-side rate limiting.
- Environment variable protection for API keys.

## 8. Accessibility (A11y)

Accessibility is integrated directly into the build and design:
- **WCAG AA Compliance:** Strict color contrast ratios in the CSS design system.
- **Keyboard Navigation:** Explicit `:focus-visible` states and a hidden "Skip to main content" link.
- **Screen Readers:** ARIA labels (`aria-live`, `role="alert"`, `aria-hidden`) used on dynamic elements like incident alerts and chat messages.
- **Automated Testing:** `@axe-core/react` is integrated into the `main.tsx` entry point to flag accessibility violations during local development.
- **RTL Support:** Full Right-To-Left language support for Arabic built into the CSS and i18n system.

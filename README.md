# Smart Stadium WC2026: Volunteer Co-pilot

**Live URL**: [smart-stadium-wc2026.vercel.app](https://smart-stadium-wc2026.vercel.app)

A GenAI-enabled Smart Stadium & Tournament Operations platform for FIFA World Cup 2026.

## 1. Persona & Vertical Focus

This submission targets the **Volunteer** persona, focused deeply on two verticals: **Crowd Management (Explainable AI/XAI)** and **Multilingual Assistance**.

Following the challenge's guidance to prioritize depth over a shallow, broad application, this project focuses heavily on solving the immediate, real-world problems of a stadium volunteer. A volunteer often lacks operational expertise and frequently faces language barriers when assisting international fans. Instead of offering disjointed generic features, the application unites these two specific problem statements into a single, cohesive workflow: The Volunteer Co-pilot. Other modules act as supporting context that feeds into this primary experience.

## 2. Feature to Problem Statement Objective Mapping

| Feature | Problem Statement Objective | Code Location |
|---|---|---|
| Volunteer Co-pilot Dashboard | Dynamic Crowd Management | `src/pages/HomePage.tsx` |
| Volunteer Alert Generator (XAI) | Explainable AI/XAI | `src/modules/crowd-management/volunteerCopilot.ts` |
| Fan Instruction Translation | Multilingual Assistance | `src/modules/crowd-management/volunteerCopilot.ts` |
| Chat Assistant | Multilingual Assistance | `src/pages/ChatAssistantPage.tsx` |

## 3. How It Works (The Core Volunteer Co-pilot Flow)

The application simulates live crowd density data for various stadium gates. When a gate crosses the critical 80% capacity threshold:
1. The congested zone data is sent to the Gemini API proxy.
2. Gemini generates **Explainable AI (XAI)** reasoning based on the live data (analyzing the exact current count, threshold, and trends), rather than relying on static rule-based templates.
3. Gemini determines an actionable directive and translates that instruction into the requested target language for the fan.
4. The volunteer receives a structured alert on their dashboard, complete with AI reasoning, a recommended action, and the translated instruction, empowering them to immediately resolve or escalate the issue.

**Sample JSON Structure returned by Gemini:**
```json
[
  {
    "zoneId": "north-stand",
    "gate": "Gate 7",
    "reasoning": "Gate 7 is at 84% capacity (840/1000) and density increased 12% in the last 3 minutes. Action is required before it reaches critical levels.",
    "action": "Redirect incoming fans to Gate 8 which has lower occupancy.",
    "severity": "high",
    "translatedInstruction": {
      "language": "es",
      "text": "La Puerta 7 está llena. Por favor, diríjase a la Puerta 8 para entrar al estadio más rápido."
    }
  }
]
```

## 4. Supporting Modules

These modules provide additional context and operational support:
- **Navigation**: Indoor navigation assistance (`src/pages/NavigationChatPage.tsx`)
- **Sustainability**: Transport and sustainability intelligence (`src/pages/SustainabilityPage.tsx`)
- **Control Room**: Staff-only incident monitoring (`src/pages/ControlRoomPage.tsx`)
- **Operations Summary**: High-level operational intelligence (`src/pages/OperationsPage.tsx`)

## 5. Tech Stack

- **Frontend**: Vite + React + TypeScript, hosted on Vercel.
- **Mapping**: Leaflet + OpenStreetMap (completely free, no billing account required). Google Maps API is not used in this project.
- **Backend/AI**: Gemini API called securely through a Vercel serverless function (`api/gemini.ts`) to keep the API key server-side only.
- **Database/Auth**: Firebase Firestore (real-time data) + Firebase Authentication. Role-based access uses Custom Claims for the staff role. (Note: Firebase Cloud Functions are *not* deployed or required).

## 6. Google Cloud Platform Services Used

This project actively utilizes the following legitimate Google services:
- **Firebase Authentication**: For securing login (Email/Password & Google OAuth).
- **Firebase Firestore**: Real-time database with security rules enforcing access.
*(Note: Cloud Functions and Cloud Run are not currently used in this architecture; all server-side logic is handled via the Vercel serverless proxy).*

## 7. Algorithmic Optimization Notes

Key algorithms have been optimized for stadium-scale performance and maintainability:
- **O(1) Map Lookups**: Linear O(n) array searches were replaced with O(1) Map lookups for efficient zone data retrieval (`getZoneDataFast` in `src/modules/crowd-management/crowdAnalysis.ts`).
- **Sliding-Window Trend Analysis**: Replaced full historical array recalculations with an O(k) sliding window approach for trend detection (`isRisingTrend` in `src/modules/crowd-management/crowdAnalysis.ts`).
- **SOLID Principles**: Components and utilities have been extracted into dedicated shared modules (e.g., `src/shared/geminiClient.ts` handles all AI caching, sanitization, and rate-limiting) to adhere to the Single Responsibility Principle.

## 8. Security

Security is strictly enforced and aligns with our detailed [SECURITY.md](SECURITY.md):
- **API Key Protection**: The `GEMINI_API_KEY` is safely stored on the server side in the Vercel environment and is never shipped to the client bundle.
- **Firebase Security Rules**: Zero-trust architecture where all collections default to deny. Operational data access requires a custom `staff` claim (`firestore.rules`).
- **Input Validation**: All user inputs are sanitized before being processed by the AI to prevent prompt injection.
- **Rate Limiting**: Server-side token bucket rate limiting (`api/gemini.ts`) and a client-side limiter (`src/shared/geminiClient.ts`) prevent abuse.

## 9. Accessibility Notes

- **Axe-core Scanning**: Integration with `@axe-core/react` (in devDependencies) for continuous accessibility scanning.
- **WCAG Contrast**: Full support for WCAG AA minimum contrast ratios.
- **Keyboard Navigation**: Native focus states and semantic HTML allow full operation via keyboard.
- **Multilingual Support**: Multilingual capabilities are treated as a core accessibility feature, ensuring international fans are not left behind.

## 10. Testing

Comprehensive unit testing is powered by Vitest:
- **Run Tests**: Execute `npm run test` or `npm run test:coverage`.
- **Edge Cases Tested**: Unit tests cover exact boundary conditions (e.g., exactly 80% threshold), overcapacity values, gracefully handling API failures, and simultaneous zone alerts.

## 11. Setup / Installation

1. **Clone the repository.**
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Configure Environment:**
   Copy `.env.example` to `.env` and fill in your Firebase configuration values using placeholder names. 
   *(Note: The Gemini API key must be set as a Vercel environment variable, not exposed in the client-side `.env`).*
4. **Start Development Server:**
   ```bash
   npm run dev
   ```
5. **Build for Production:**
   ```bash
   npm run build
   ```

## 12. CSV Upload for Jury Testing

To easily test the XAI pipeline without waiting for live simulation data to cross thresholds:
1. Log in to the application.
2. Navigate to the Volunteer Co-pilot dashboard.
3. Click "Upload CSV" and select your custom data file (a sample is provided at `sample-data.csv`).
4. The system will override the live feed with your data and instantly trigger Gemini XAI alerts for any gate exceeding the 80% capacity threshold.

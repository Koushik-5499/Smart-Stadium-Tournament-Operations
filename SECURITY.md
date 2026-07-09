# Security & Trust at Smart Stadium WC2026

Security and Trust are paramount for a platform supporting a mega-event like the FIFA World Cup. This document outlines the security architecture, risk mitigations, and AI safety measures implemented in this project to align with the **Security (30 points)** and **Trust & Safety** evaluation criteria.

## 1. Firebase Security Rules (Zero-Trust Data Access)

We use Firestore as the primary real-time database. Access is strictly controlled via Firestore Security Rules located in `firestore.rules`.

### Principles Implemented:
- **Default Deny:** All collections deny read/write by default.
- **Role-Based Access Control (RBAC):** Access to sensitive operational data (like incident reports) is restricted to users with the `staff` custom claim.
- **Data Validation:** Rules validate incoming data shapes and types (e.g., ensuring `severity` is an integer between 1 and 5).
- **Public vs. Private:** Certain data (like public zones or general schedules) is readable by all, but only writable by staff.

**Example Implementation:**
```javascript
match /incidents/{incidentId} {
  // Only authenticated staff can read or write incidents
  allow read, write: if request.auth != null && request.auth.token.role == 'staff';
}
```

## 2. API Key Protection and Environment Secrets

The Gemini API key and Firebase configuration details are never hardcoded in the source code.

- **Environment Variables:** All secrets are stored in `.env.local` which is excluded from version control via `.gitignore`.
- **Build Process:** Vite injects these variables securely at build time.

## 3. Generative AI Safety & Prompt Injection Prevention

When using Large Language Models (LLMs) for fan-facing features (like the Chat Assistant), there is a risk of Prompt Injection or offensive outputs. We have implemented a multi-layered defense.

### Defense 1: Strict System Prompts
System prompts tightly constrain the AI's persona and task.
*Example: "You are a helpful stadium assistant... Answer ONLY questions related to the stadium. If asked about other topics, politely decline."*

### Defense 2: Input Sanitization
User inputs are sanitized before being sent to the AI to strip out HTML, script tags, and common injection patterns. (See `src/shared/validators.ts`).

### Defense 3: Rate Limiting
To prevent abuse or denial-of-wallet attacks via the Gemini API, a client-side rate limiter is implemented (See `src/shared/geminiClient.ts`). It restricts the number of API calls a single client can make within a time window.

### Defense 4: Caching
Identical queries are cached (TTL-based) to reduce API load and prevent redundant LLM processing for common questions (e.g., "Where is the nearest restroom?"). (See `src/shared/cache.ts`).

## 4. XSS and Data Sanitization

React inherently protects against most Cross-Site Scripting (XSS) attacks by escaping values before rendering. However, when handling raw data or AI outputs, we use utility functions to escape characters.

## 5. Authentication

- **Firebase Authentication:** Handles secure user sign-in (Email/Password & Google OAuth).
- **Session Management:** Secure, HTTP-only tokens (managed by Firebase) ensure that sessions cannot be hijacked via client-side scripts.

## 6. Incident Reporting Privacy

Incident reports generated in the Control Room Copilot may contain sensitive information.
- This data is never exposed to the public UI.
- All AI processing of incidents strictly occurs within the authorized session context, and the prompts do not leak PII (Personally Identifiable Information).

## 7. Dependency Scanning

We regularly audit dependencies for known vulnerabilities using `npm audit`.

## 8. CI/CD Security (Firebase Hosting)

Deployments to Firebase Hosting are secured via GitHub Actions (if configured) or direct CLI, utilizing short-lived access tokens or service accounts, ensuring the production environment cannot be compromised easily.

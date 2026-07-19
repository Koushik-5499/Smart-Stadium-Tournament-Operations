# Security & Trust at Smart Stadium WC2026

Security and Trust are paramount for a platform supporting a mega-event like the FIFA World Cup. This document outlines the security architecture, risk mitigations, and AI safety measures implemented in this project to align with the **Security (30 points)** and **Trust & Safety** evaluation criteria.

## 1. Firebase Security Rules (Zero-Trust Data Access)

We use Firestore as the primary real-time database. Access is strictly controlled via Firestore Security Rules located in `firestore.rules`.

### Principles Implemented:
- **Default Deny:** All collections deny read/write by default. A catch-all rule `match /{document=**} { allow read, write: if false; }` ensures any unlisted collection is automatically denied.
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

## 2. API Key Protection and Vercel Proxy Hardening

The Gemini API key is completely isolated from the client bundle. The frontend communicates with Gemini exclusively via our Vercel Serverless Function (`/api/gemini`). To protect this endpoint from abuse, we have implemented four layers of defense:

- **Domain-Restricted CORS:** The proxy explicitly restricts `Access-Control-Allow-Origin` to our production domain (`https://smart-stadium-wc2026.vercel.app`). This prevents unauthorized websites from embedding our endpoint via cross-origin requests.
- **Per-IP Rate Limiting:** We track requests based on the client's IP address (`x-forwarded-for`), capping requests to 15 per burst with a slow token refill. This isolates abuse and prevents a single bad actor from exhausting our API quota, while ensuring legitimate users (like volunteers sending rapid alerts) are uninterrupted.
- **Shared-Secret Header:** The frontend passes a custom header (`X-App-Secret`) baked in at build time (`VITE_APP_PROXY_SECRET`), which the server validates. 
  - *Note on Limitations:* This is a defense-in-depth measure, not cryptographic authentication. A determined attacker could extract this secret from the client bundle. However, combined with CORS and per-IP rate limiting, it raises the bar significantly against automated or casual scripted abuse.
- **Strict Payload Validation:** The proxy strictly enforces string types and a maximum payload size of 4000 characters before attempting to contact Gemini, preventing denial-of-wallet attacks via oversized requests.

## 3. Generative AI Safety & Prompt Injection Prevention

When using Large Language Models (LLMs) for fan-facing features (like the Chat Assistant), there is a risk of Prompt Injection or offensive outputs. We have implemented a multi-layered defense.

### Defense 1: Strict System Prompts
System prompts tightly constrain the AI's persona and task.
*Example: "You are a helpful stadium assistant... Answer ONLY questions related to the stadium. If asked about other topics, politely decline."*

### Defense 2: Input Sanitization
User inputs are sanitized before being sent to the AI to strip out HTML, script tags, and common injection patterns. (See `src/shared/validators.ts`).

### Defense 3: Caching
Identical queries are cached (TTL-based) on the client side to reduce API load and prevent redundant LLM processing for common questions (e.g., "Where is the nearest restroom?"). (See `src/shared/cache.ts`).

### Defense 5: CSV Upload Validation
User-uploaded CSV data is validated before processing to prevent injection of malformed data (NaN, negative values, zero-capacity zones). The `CsvUploader` component (See `src/shared/components/CsvUploader.tsx`) validates every numeric field and rejects rows with invalid data.

### Defense 6: Login Form Constraints
Login form inputs enforce `maxLength` (254 for email, 128 for password) and `required` attributes to prevent abuse and ensure valid input shapes at the HTML level, in addition to Firebase Authentication's server-side validation.

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

## 8. CI/CD Security (Vercel)

Deployments to Vercel are secured via GitHub integration. Vercel automatically builds and deploys the `main` branch, ensuring a secure pipeline from code commit to production deployment.


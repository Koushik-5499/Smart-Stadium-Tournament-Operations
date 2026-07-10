"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateVolunteerAlerts = void 0;
const functions = __importStar(require("firebase-functions"));
const generative_ai_1 = require("@google/generative-ai");
const SYSTEM_PROMPT = `You are the "Volunteer Co-pilot" AI for a FIFA World Cup 2026 stadium.
Your job is to assist a stadium volunteer who has no prior operational knowledge and faces language barriers.
You will receive real-time crowd density data for a specific gate that has crossed the 80% capacity threshold.
You must analyze the data and generate a structured JSON alert.

CRITICAL REQUIREMENTS:
1. Explainable AI (XAI): Provide a "reasoning" field explaining exactly WHY the alert fired based on the provided data. Explain the current count, capacity threshold, and rate of increase if available. Do not use generic text; explain the math/logic.
2. Provide a clear "action" for the volunteer (e.g., "Redirect incoming fans to Gate X").
3. Provide a "translatedInstruction" that the volunteer can show to a fan approaching the gate. Translate the instruction into the requested target language.

You MUST respond ONLY with a valid JSON array of alert objects, matching this structure:
[
  {
    "zoneId": "...",
    "gate": "...",
    "reasoning": "...",
    "action": "...",
    "severity": "high" | "critical",
    "translatedInstruction": {
      "language": "es",
      "text": "..."
    }
  }
]

FEW-SHOT EXAMPLES:
Input:
Target Language: es
Data: {"zoneId":"north-stand","gate":"Gate 7","currentCount":840,"capacity":1000,"occupancyRate":0.84,"trend":"+12% in 3 mins"}

Output:
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
`;
exports.generateVolunteerAlerts = functions.https.onCall(async (data, context) => {
    // Ensure the user is authenticated (if required by your rules, though maybe for the demo we don't strict-enforce)
    // if (!context.auth) {
    //   throw new functions.https.HttpsError('unauthenticated', 'Endpoint requires authentication!');
    // }
    var _a;
    const { congestedZones, targetLanguage } = data;
    if (!congestedZones || congestedZones.length === 0) {
        return [];
    }
    // Uses the GEMINI_API_KEY environment variable. 
    // In Firebase, you'd set this via: firebase functions:config:set gemini.key="YOUR_KEY"
    // For the demo, we fallback to process.env.VITE_GEMINI_API_KEY or similar if needed.
    const apiKey = process.env.GEMINI_API_KEY || ((_a = functions.config().gemini) === null || _a === void 0 ? void 0 : _a.key) || "";
    if (!apiKey) {
        console.error("Missing Gemini API Key");
        throw new functions.https.HttpsError('internal', 'Missing Gemini API Key');
    }
    const genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash', systemInstruction: SYSTEM_PROMPT });
    const dataStr = JSON.stringify({
        targetLanguage: targetLanguage || 'en',
        data: congestedZones.map((z) => ({
            zoneId: z.zoneId,
            gate: z.gate,
            currentCount: z.currentCount,
            capacity: z.capacity,
            occupancyRate: z.occupancyRate
        }))
    });
    try {
        const result = await model.generateContent(dataStr);
        const responseText = result.response.text();
        const jsonStr = responseText.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(jsonStr);
        return (Array.isArray(parsed) ? parsed : [parsed]).map((p) => { var _a, _b; var _c, _d, _e, _f, _g, _h; return ({
            zoneId: String((_c = p.zoneId) !== null && _c !== void 0 ? _c : ''),
            gate: String((_d = p.gate) !== null && _d !== void 0 ? _d : ''),
            reasoning: String((_e = p.reasoning) !== null && _e !== void 0 ? _e : 'Alert triggered due to high density.'),
            action: String((_f = p.action) !== null && _f !== void 0 ? _f : 'Monitor situation.'),
            severity: (p.severity === 'critical' ? 'critical' : 'high'),
            translatedInstruction: {
                language: String((_g = (_a = p.translatedInstruction) === null || _a === void 0 ? void 0 : _a.language) !== null && _g !== void 0 ? _g : targetLanguage),
                text: String((_h = (_b = p.translatedInstruction) === null || _b === void 0 ? void 0 : _b.text) !== null && _h !== void 0 ? _h : 'Please use another gate.')
            }
        }); });
    }
    catch (error) {
        console.error('Failed to generate volunteer alert via Cloud Function:', error);
        // Graceful fallback on API failure
        return congestedZones.map((z) => ({
            zoneId: z.zoneId,
            gate: z.gate,
            reasoning: `Fallback: Gate reached ${Math.round(z.occupancyRate * 100)}% capacity (API unreachable).`,
            action: 'Redirect fans to nearest open gate.',
            severity: z.occupancyRate >= 0.95 ? 'critical' : 'high',
            translatedInstruction: {
                language: targetLanguage,
                text: 'This gate is full. Please use another gate.'
            }
        }));
    }
});
//# sourceMappingURL=index.js.map
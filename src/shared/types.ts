/**
 * Shared TypeScript type definitions for the Smart Stadium platform.
 *
 * Provides interfaces for all data models, component props, and API
 * responses used across modules.
 *
 * @module shared/types
 */

/* ──────────────────────────────────────────────────────────────────
 * Crowd Management Types
 * ────────────────────────────────────────────────────────────────── */

/** Density reading from a single stadium zone/gate sensor. */
export interface ZoneDensity {
  zoneId: string;
  zoneName: string;
  currentCount: number;
  capacity: number;
  /** 0.0 – 1.0 occupancy ratio. */
  occupancyRate: number;
  timestamp: number;
  gate: string;
}

/** AI-generated crowd prediction for a zone. */
export interface CrowdPrediction {
  zoneId: string;
  predictedOccupancy: number;
  minutesAhead: number;
  confidence: number;
  rerouteSuggestion: string;
  alertLevel: 'low' | 'medium' | 'high' | 'critical';
}

/* ──────────────────────────────────────────────────────────────────
 * Incident / Control Room Types
 * ────────────────────────────────────────────────────────────────── */

/** Severity levels for incidents (1 = lowest, 5 = critical). */
export type SeverityLevel = 1 | 2 | 3 | 4 | 5;

/** An incident report in the Control Room system. */
export interface Incident {
  id: string;
  title: string;
  description: string;
  location: string;
  reportedAt: number;
  severity: SeverityLevel;
  status: 'open' | 'in-progress' | 'resolved';
  aiSummary?: string;
  aiRecommendation?: string;
  reportedBy: string;
}

/* ──────────────────────────────────────────────────────────────────
 * Navigation Types
 * ────────────────────────────────────────────────────────────────── */

/** A location node in the stadium graph. */
export interface StadiumLocation {
  id: string;
  name: string;
  type: 'gate' | 'seat-section' | 'restroom' | 'food-court' | 'medical' | 'exit' | 'concourse' | 'lobby';
  floor: number;
  x: number;
  y: number;
}

/** An edge in the stadium navigation graph. */
export interface NavigationEdge {
  from: string;
  to: string;
  distance: number;
  description: string;
  accessible: boolean;
}

/** A navigation instruction (turn-by-turn step). */
export interface NavigationStep {
  instruction: string;
  distance: number;
  landmark?: string;
}

/** A chat message in the navigation/multilingual chatbot. */
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  language?: string;
}

/* ──────────────────────────────────────────────────────────────────
 * Sustainability & Transport Types
 * ────────────────────────────────────────────────────────────────── */

/** Sustainability metrics for a zone. */
export interface SustainabilityData {
  zoneId: string;
  zoneName: string;
  wasteKg: number;
  recycledKg: number;
  carbonKg: number;
  energyKwh: number;
  timestamp: number;
}

/** Transport load data for a route. */
export interface TransportRoute {
  routeId: string;
  routeName: string;
  type: 'shuttle' | 'parking' | 'metro';
  currentLoad: number;
  capacity: number;
  estimatedWaitMinutes: number;
  aiRecommendation?: string;
}

/* ──────────────────────────────────────────────────────────────────
 * Operations Summary Types
 * ────────────────────────────────────────────────────────────────── */

/** A daily operations summary ("morning briefing"). */
export interface OperationsSummary {
  id: string;
  generatedAt: number;
  crowdHighlights: string;
  incidentHighlights: string;
  transportHighlights: string;
  sustainabilityHighlights: string;
  keyRecommendations: string[];
  overallStatus: 'green' | 'yellow' | 'red';
}

/* ──────────────────────────────────────────────────────────────────
 * Language & i18n Types
 * ────────────────────────────────────────────────────────────────── */

/** Supported UI languages. */
export type SupportedLanguage = 'en' | 'es' | 'pt' | 'fr' | 'ar' | 'ta' | 'hi';

/** Translation dictionary for a single language. */
export type TranslationDict = Record<string, string>;

/* ──────────────────────────────────────────────────────────────────
 * Auth Types
 * ────────────────────────────────────────────────────────────────── */

/** User with optional staff role. */
export interface StaffUser {
  uid: string;
  email: string;
  displayName: string;
  isStaff: boolean;
}

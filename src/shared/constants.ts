/**
 * Stadium constants: zones, gates, map data, and configuration.
 *
 * Defines the stadium layout used across crowd management,
 * navigation, sustainability, and operations modules.
 *
 * @module shared/constants
 */

import type { StadiumLocation, NavigationEdge } from './types';

/** Authorized staff email for login access. */
export const STAFF_EMAIL = 'koushik4680@gmail.com';

/** Stadium zone definitions with capacity data. */
export const STADIUM_ZONES = [
  { id: 'north-stand', name: 'North Stand', capacity: 15000, gate: 'Gate A' },
  { id: 'south-stand', name: 'South Stand', capacity: 15000, gate: 'Gate B' },
  { id: 'east-wing', name: 'East Wing', capacity: 10000, gate: 'Gate C' },
  { id: 'west-wing', name: 'West Wing', capacity: 10000, gate: 'Gate D' },
  { id: 'vip-section', name: 'VIP Section', capacity: 5000, gate: 'Gate E' },
  { id: 'concourse-main', name: 'Main Concourse', capacity: 8000, gate: 'Gate A' },
  { id: 'food-court-1', name: 'Food Court North', capacity: 2000, gate: 'Gate A' },
  { id: 'food-court-2', name: 'Food Court South', capacity: 2000, gate: 'Gate B' },
] as const;

/** Crowd density thresholds for alert levels. */
export const DENSITY_THRESHOLDS = {
  low: 0.5,
  medium: 0.7,
  high: 0.85,
  critical: 0.95,
} as const;

/** Stadium navigation locations (graph nodes). */
export const STADIUM_LOCATIONS: StadiumLocation[] = [
  { id: 'gate-a', name: 'Gate A', type: 'gate', floor: 0, x: 50, y: 10 },
  { id: 'gate-b', name: 'Gate B', type: 'gate', floor: 0, x: 50, y: 90 },
  { id: 'gate-c', name: 'Gate C', type: 'gate', floor: 0, x: 10, y: 50 },
  { id: 'gate-d', name: 'Gate D', type: 'gate', floor: 0, x: 90, y: 50 },
  { id: 'gate-e', name: 'Gate E (VIP)', type: 'gate', floor: 0, x: 90, y: 10 },
  { id: 'gate-12', name: 'Gate 12', type: 'gate', floor: 0, x: 30, y: 10 },
  { id: 'lobby-main', name: 'Main Lobby', type: 'lobby', floor: 0, x: 50, y: 50 },
  { id: 'concourse-n', name: 'North Concourse', type: 'concourse', floor: 1, x: 50, y: 20 },
  { id: 'concourse-s', name: 'South Concourse', type: 'concourse', floor: 1, x: 50, y: 80 },
  { id: 'section-101', name: 'Section 101', type: 'seat-section', floor: 1, x: 30, y: 30 },
  { id: 'section-202', name: 'Section 202', type: 'seat-section', floor: 2, x: 70, y: 30 },
  { id: 'section-303', name: 'Section 303', type: 'seat-section', floor: 2, x: 30, y: 70 },
  { id: 'restroom-n', name: 'Restroom (North)', type: 'restroom', floor: 1, x: 40, y: 20 },
  { id: 'restroom-s', name: 'Restroom (South)', type: 'restroom', floor: 1, x: 60, y: 80 },
  { id: 'food-north', name: 'Food Court North', type: 'food-court', floor: 1, x: 60, y: 20 },
  { id: 'food-south', name: 'Food Court South', type: 'food-court', floor: 1, x: 40, y: 80 },
  { id: 'medical-1', name: 'Medical Station 1', type: 'medical', floor: 0, x: 20, y: 50 },
  { id: 'exit-emergency', name: 'Emergency Exit', type: 'exit', floor: 0, x: 10, y: 10 },
];

/** Stadium navigation edges (graph connections). */
export const STADIUM_EDGES: NavigationEdge[] = [
  { from: 'gate-a', to: 'lobby-main', distance: 120, description: 'Walk straight through the entrance hall', accessible: true },
  { from: 'gate-b', to: 'lobby-main', distance: 120, description: 'Walk straight through the south entrance', accessible: true },
  { from: 'gate-c', to: 'lobby-main', distance: 100, description: 'Walk east along the main corridor', accessible: true },
  { from: 'gate-d', to: 'lobby-main', distance: 100, description: 'Walk west along the main corridor', accessible: true },
  { from: 'gate-e', to: 'lobby-main', distance: 150, description: 'Walk through VIP corridor to lobby', accessible: true },
  { from: 'gate-12', to: 'gate-a', distance: 60, description: 'Walk east along the north facade', accessible: true },
  { from: 'gate-12', to: 'concourse-n', distance: 80, description: 'Enter and take the ramp up to the north concourse', accessible: true },
  { from: 'lobby-main', to: 'concourse-n', distance: 80, description: 'Take the escalator/ramp up to the north concourse', accessible: true },
  { from: 'lobby-main', to: 'concourse-s', distance: 80, description: 'Take the escalator/ramp up to the south concourse', accessible: true },
  { from: 'lobby-main', to: 'medical-1', distance: 60, description: 'Turn left and walk to the medical station', accessible: true },
  { from: 'concourse-n', to: 'section-101', distance: 50, description: 'Enter Section 101 through turnstile', accessible: true },
  { from: 'concourse-n', to: 'section-202', distance: 70, description: 'Walk east and enter Section 202', accessible: true },
  { from: 'concourse-n', to: 'restroom-n', distance: 30, description: 'Restrooms are on your left', accessible: true },
  { from: 'concourse-n', to: 'food-north', distance: 40, description: 'Food court is on your right', accessible: true },
  { from: 'concourse-s', to: 'section-303', distance: 50, description: 'Enter Section 303 through turnstile', accessible: true },
  { from: 'concourse-s', to: 'restroom-s', distance: 30, description: 'Restrooms are on your right', accessible: true },
  { from: 'concourse-s', to: 'food-south', distance: 40, description: 'Food court is on your left', accessible: true },
  { from: 'lobby-main', to: 'exit-emergency', distance: 200, description: 'Follow emergency exit signs west', accessible: true },
];

/** Severity level labels for the control room. */
export const SEVERITY_LABELS: Record<number, string> = {
  1: 'Info',
  2: 'Low',
  3: 'Medium',
  4: 'High',
  5: 'Critical',
};

/** Severity level colors (WCAG AA compliant against dark backgrounds). */
export const SEVERITY_COLORS: Record<number, string> = {
  1: '#4ade80',
  2: '#60a5fa',
  3: '#fbbf24',
  4: '#f97316',
  5: '#ef4444',
};

/** Supported languages for multilingual features. */
export const SUPPORTED_LANGUAGES = [
  { code: 'en' as const, name: 'English', dir: 'ltr' as const },
  { code: 'es' as const, name: 'Español', dir: 'ltr' as const },
  { code: 'pt' as const, name: 'Português', dir: 'ltr' as const },
  { code: 'fr' as const, name: 'Français', dir: 'ltr' as const },
  { code: 'ar' as const, name: 'العربية', dir: 'rtl' as const },
  { code: 'ta' as const, name: 'தமிழ்', dir: 'ltr' as const },
  { code: 'hi' as const, name: 'हिन्दी', dir: 'ltr' as const },
] as const;

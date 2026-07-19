import { parseNavigationIntent } from './intentParser';
import { findRoute, resolveLocation, getAllLocations } from './stadiumMap';
import { callGemini } from '../../shared/geminiClient';

export function useNavigationChat() {
  const handleNavigationRequest = async (text: string) => {
    const intent = await parseNavigationIntent(text);
    let responseText: string;

    if (intent.type === 'navigation' && intent.to) {
      const fromId = intent.from ?? 'lobby-main';
      const toId = resolveLocation(intent.to) ?? intent.to;
      const route = findRoute(fromId, toId);

      if (route) {
        const totalDist = route.reduce((s, step) => s + step.distance, 0);
        const steps = route
          .map((step, i) => `${i + 1}. ${step.instruction}${step.landmark ? ` (${step.landmark})` : ''}`)
          .join('\n');
        responseText = `🗺️ **Directions** (${totalDist}m total):\n\n${steps}`;
      } else {
        responseText = `I couldn't find a route to "${intent.to}". Please try a different location.`;
      }
    } else if (intent.type === 'facility-search') {
      const locationId = intent.to ? resolveLocation(intent.to) : null;
      if (locationId) {
        const route = findRoute('lobby-main', locationId);
        if (route) {
          const steps = route.map((s, i) => `${i + 1}. ${s.instruction}`).join('\n');
          responseText = `📍 Here are directions:\n\n${steps}`;
        } else {
          responseText = `I found the location but couldn't generate a route. Try asking for a specific destination.`;
        }
      } else {
        responseText = 'I can help you find: gates, restrooms, food courts, medical stations, and specific sections. What are you looking for?';
      }
    } else {
      // General question — use Gemini
      responseText = await callGemini(
        'You are a helpful stadium assistant at FIFA World Cup 2026. Answer questions concisely. Available locations: ' +
          getAllLocations().map((l) => l.name).join(', '),
        text,
      );
    }

    return { content: responseText };
  };

  return { handleNavigationRequest };
}

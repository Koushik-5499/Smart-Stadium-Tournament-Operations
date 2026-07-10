/**
 * Reusable metric/stat card component.
 *
 * Extracted from CrowdDashboardPage, ControlRoomPage, and
 * SustainabilityPage which all repeat the same stat-card pattern
 * (DRY / Open-Closed principle).
 *
 * @module shared/components/StatCard
 */

interface Props {
  label: string;
  value: string | number;
  color?: string;
}

export default function StatCard({ label, value, color }: Props) {
  return (
    <div className="stat-card" role="region" aria-label={`${label} statistic`}>
      <div className="stat-label">{label}</div>
      <div className="stat-value" style={color ? { color } : undefined}>
        {value}
      </div>
    </div>
  );
}

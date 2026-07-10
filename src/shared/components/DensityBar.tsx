/**
 * Reusable density/progress bar component.
 *
 * Extracted from HomePage and CrowdDashboardPage which both render
 * identical density bars for zone occupancy visualization
 * (DRY / Open-Closed principle).
 *
 * @module shared/components/DensityBar
 */

import { getAlertLevel, formatOccupancy } from '../../modules/crowd-management/crowdAnalysis';
import { SEVERITY_COLORS } from '../constants';

interface Props {
  label: string;
  sublabel?: string;
  occupancyRate: number;
}

export default function DensityBar({ label, sublabel, occupancyRate }: Props) {
  const level = getAlertLevel(occupancyRate);
  const colorKey = level === 'critical' ? 5 : level === 'high' ? 4 : level === 'medium' ? 3 : 1;

  return (
    <div className="density-bar-container">
      <div className="density-bar-header">
        <span>
          {label}
          {sublabel && (
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
              {' '}({sublabel})
            </span>
          )}
        </span>
        <span style={{ color: SEVERITY_COLORS[colorKey] }}>
          {formatOccupancy(occupancyRate)}
        </span>
      </div>
      <div
        className="density-bar"
        role="progressbar"
        aria-valuenow={Math.round(occupancyRate * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${label} occupancy`}
      >
        <div
          className={`density-bar-fill ${level}`}
          style={{ width: `${occupancyRate * 100}%` }}
        />
      </div>
    </div>
  );
}

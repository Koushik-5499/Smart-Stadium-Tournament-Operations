/**
 * Reusable page header with title and subtitle.
 *
 * Extracted as a shared component to eliminate duplication across
 * all 8 page components (DRY / Open-Closed principle).
 *
 * @module shared/components/PageHeader
 */

interface Props {
  title: string;
  subtitle?: string;
}

export default function PageHeader({ title, subtitle }: Props) {
  return (
    <header className="page-header" role="banner" style={{ marginBottom: 'var(--space-md)' }}>
      <h1 className="page-title">{title}</h1>
      {subtitle && <p className="page-subtitle">{subtitle}</p>}
    </header>
  );
}

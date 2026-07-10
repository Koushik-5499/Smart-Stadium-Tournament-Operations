import { useState, useRef } from 'react';
import type { ZoneDensity } from '../types';

interface Props {
  onDataLoaded: (data: ZoneDensity[]) => void;
}

export default function CsvUploader({ onDataLoaded }: Props) {
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split('\n').map(line => line.trim()).filter(line => line);
        
        if (lines.length < 2) throw new Error("CSV must contain a header and at least one data row.");
        
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        
        const requiredHeaders = ['zoneid', 'zonename', 'currentcount', 'capacity', 'gate'];
        for (const req of requiredHeaders) {
          if (!headers.includes(req)) throw new Error(`Missing required header: ${req}`);
        }

        const parsedData: ZoneDensity[] = lines.slice(1).map(line => {
          const values = line.split(',').map(v => v.trim());
          const getVal = (col: string) => values[headers.indexOf(col)];
          
          const capacity = Number(getVal('capacity'));
          const currentCount = Number(getVal('currentcount'));
          const occupancyRate = Math.min(1.0, currentCount / capacity);
          
          return {
            zoneId: getVal('zoneid'),
            zoneName: getVal('zonename'),
            currentCount,
            capacity,
            occupancyRate,
            timestamp: Date.now(),
            gate: getVal('gate')
          };
        });

        onDataLoaded(parsedData);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to parse CSV');
      }
    };
    reader.onerror = () => setError('Failed to read file');
    reader.readAsText(file);
  };

  return (
    <div className="card" style={{ marginBottom: 'var(--space-md)' }}>
      <div className="card-header">
        <h2 className="card-title">Test with your own data</h2>
        <span className="card-badge" style={{ background: 'rgba(234, 179, 8, 0.15)', color: '#ca8a04' }}>
          Jury Tool
        </span>
      </div>
      <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-md)' }}>
        Upload a CSV file to override the live simulated data and trigger the XAI Volunteer Copilot.
        Required columns: <code>zoneId, zoneName, currentCount, capacity, gate</code>.
      </p>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
        <input 
          type="file" 
          accept=".csv" 
          onChange={handleFileUpload} 
          ref={fileInputRef}
          style={{ display: 'none' }}
          id="csv-upload"
        />
        <label htmlFor="csv-upload" className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
          Upload CSV
        </label>
        <button 
          className="btn btn-secondary btn-sm" 
          onClick={() => {
            if (fileInputRef.current) fileInputRef.current.value = '';
            onDataLoaded([]); // Clear custom data
          }}
        >
          Resume Live Feed
        </button>
      </div>
      {error && <div style={{ color: 'var(--accent-danger)', fontSize: 'var(--font-size-sm)', marginTop: 'var(--space-sm)' }}>{error}</div>}
    </div>
  );
}

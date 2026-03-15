'use client';
import { useState, useEffect, useRef } from 'react';

const pad = (n) => String(n).padStart(2, '0');

const getElapsed = (from) => {
  const diff = Math.max(0, Date.now() - new Date(from).getTime());
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return { h, m, s };
};

export const CoffeeWidget = () => {
  const [lastDrank, setLastDrank] = useState(null);
  const [tick, setTick] = useState(0);
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const confirmTimer = useRef(null);

  useEffect(() => {
    fetch('/api/get-last-coffee-date')
      .then((r) => r.json())
      .then((d) => { if (d.last_drank) setLastDrank(d.last_drank); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!lastDrank) return;
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [lastDrank]);

  const handleReset = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/coffee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (res.ok) {
        const now = new Date().toISOString();
        setLastDrank(now);
        setConfirmed(true);
        clearTimeout(confirmTimer.current);
        confirmTimer.current = setTimeout(() => setConfirmed(false), 2500);
      }
    } finally {
      setLoading(false);
    }
  };

  const elapsed = lastDrank ? getElapsed(lastDrank) : null;

  return (
    <div style={{
      border: '1px solid rgba(251,191,36,0.25)',
      borderRadius: '8px',
      padding: '16px 20px',
      background: 'rgba(251,191,36,0.04)',
      display: 'inline-flex',
      flexDirection: 'column',
      gap: '12px',
      minWidth: '220px',
    }}>
      {/* Label */}
      <span style={{
        fontSize: '10px',
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
        color: 'rgba(251,191,36,0.5)',
        fontWeight: 600,
      }}>
        ☕ since last coffee
      </span>

      {/* Counter */}
      <div style={{
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
        fontSize: '32px',
        fontWeight: 700,
        letterSpacing: '0.05em',
        color: elapsed ? '#FBBF24' : 'rgba(251,191,36,0.3)',
        lineHeight: 1,
        textShadow: elapsed ? '0 0 20px rgba(251,191,36,0.3)' : 'none',
        transition: 'color 0.3s',
      }}>
        {elapsed
          ? `${pad(elapsed.h)}:${pad(elapsed.m)}:${pad(elapsed.s)}`
          : '--:--:--'}
      </div>

      {/* Button */}
      <button
        onClick={handleReset}
        disabled={loading}
        style={{
          marginTop: '4px',
          padding: '8px 16px',
          border: confirmed
            ? '1px solid rgba(74,222,128,0.6)'
            : '1px solid rgba(251,191,36,0.5)',
          borderRadius: '6px',
          background: confirmed
            ? 'rgba(74,222,128,0.08)'
            : loading
            ? 'rgba(251,191,36,0.05)'
            : 'rgba(251,191,36,0.08)',
          color: confirmed ? '#4ADE80' : '#FBBF24',
          fontSize: '13px',
          fontWeight: 600,
          cursor: loading ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s',
          letterSpacing: '0.02em',
          opacity: loading ? 0.6 : 1,
        }}
        onMouseEnter={(e) => {
          if (!loading && !confirmed) {
            e.currentTarget.style.background = 'rgba(251,191,36,0.15)';
          }
        }}
        onMouseLeave={(e) => {
          if (!loading && !confirmed) {
            e.currentTarget.style.background = 'rgba(251,191,36,0.08)';
          }
        }}
      >
        {confirmed ? '✓ Logged' : loading ? 'Logging...' : 'Had a coffee'}
      </button>
    </div>
  );
};

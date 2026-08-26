import React, { useEffect, useRef } from 'react';
import { Terminal, Trash2 } from 'lucide-react';

export default function LiveLogsStream({ logs, onClearLogs }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <section className="glass-card animate-slide-up" style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      flex: 1
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Terminal size={16} style={{ color: 'var(--accent-cyan)' }} />
          <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>Live Logs & Events</h3>
        </div>
        <button
          onClick={onClearLogs}
          style={{
            minWidth: '28px',
            minHeight: '28px',
            background: 'transparent',
            color: 'var(--text-muted)',
            padding: 0
          }}
          title="Clear Logs"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Terminal View */}
      <div
        ref={containerRef}
        style={{
          background: 'rgba(11, 14, 20, 0.85)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          padding: '12px',
          height: '200px',
          overflowY: 'auto',
          fontFamily: '"Fira Code", "Courier New", Courier, monospace',
          fontSize: '11px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}
      >
        {logs.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>
            Listening for network events...
          </div>
        ) : (
          logs.map((log) => {
            let color = 'var(--text-secondary)';
            if (log.type === 'SUCCESS') color = 'var(--accent-profit)';
            if (log.type === 'ERROR') color = 'var(--accent-loss)';
            if (log.type === 'INFO') color = 'var(--accent-cyan)';
            if (log.type === 'WARNING') color = '#F59E0B';

            return (
              <div key={log.id} style={{ display: 'flex', gap: '8px', lineHeight: '1.4' }}>
                <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>[{log.timestamp}]</span>
                <span style={{ color: color, flexShrink: 0 }}>[{log.type}]</span>
                <span style={{ color: '#F3F4F6' }}>{log.message}</span>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}

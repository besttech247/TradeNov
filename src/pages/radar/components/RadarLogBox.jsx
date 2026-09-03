import React, { useState } from 'react';

export function RadarLogBox({ logs, onClear, onCopy }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-background-light/40 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md">
      <div className="px-5 py-3.5 border-b border-white/10 flex items-center justify-between">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 text-xs font-bold text-white hover:text-cyan-400 transition-colors"
        >
          <span>{isOpen ? '▼' : '◀'}</span>
          <span>سجل تنفيذ الرادار الحي (Live Execution Log)</span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-text-muted">
            {logs.length} أحداث
          </span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={onCopy}
            disabled={logs.length === 0}
            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-40 border border-white/10 text-text-muted hover:text-white text-xs font-medium transition-all"
          >
            📋 نسخ السجل
          </button>
          <button
            onClick={onClear}
            disabled={logs.length === 0}
            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-40 border border-white/10 text-text-muted hover:text-rose-400 text-xs font-medium transition-all"
          >
            🗑️ مسح
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="p-4 max-h-48 overflow-y-auto font-mono text-xs text-text-muted bg-black/60 space-y-1 scrollbar-thin scrollbar-thumb-white/10">
          {logs.length === 0 ? (
            <div className="text-center py-4 text-text-muted text-[11px]">
              لا توجد أحداث مسجلة بعد...
            </div>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className={`py-1 border-b border-white/5 flex items-start gap-2 ${
                  log.type === 'error'
                    ? 'text-rose-400'
                    : log.type === 'warning'
                    ? 'text-amber-400'
                    : log.type === 'highlight'
                    ? 'text-emerald-300 font-bold'
                    : 'text-text-muted'
                }`}
              >
                <span className="text-[10px] text-white/40 select-none">[{log.time}]</span>
                <span>{log.text}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

import React from 'react';
import { ShieldAlert } from 'lucide-react';

export default function EmergencyButton({ onKillAll, active }) {
  return (
    <button
      onClick={() => {
        if (window.confirm("🚨 WARNING: Are you sure you want to trigger the Emergency Kill Switch? This will close all positions and pause all active bots immediately!")) {
          onKillAll();
        }
      }}
      className="btn-danger pulse-glow"
      style={{
        position: 'fixed',
        bottom: '80px',
        right: '16px',
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        boxShadow: '0 4px 20px rgba(244, 63, 94, 0.4)',
        zIndex: 9999,
        border: '2px solid white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        background: '#F43F5E',
        color: 'white',
        padding: 0,
        minWidth: 'auto',
        minHeight: 'auto'
      }}
      title="EMERGENCY KILL SWITCH"
    >
      <ShieldAlert size={28} />
    </button>
  );
}

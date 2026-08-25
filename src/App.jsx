import React, { useState, useEffect } from 'react';

export default function App() {
  const [dbStatus, setDbStatus] = useState('idle'); // idle | loading | connected | error | unconfigured
  const [dbData, setDbData] = useState(null);
  const [setupStatus, setSetupStatus] = useState('idle'); // idle | loading | success | error
  const [setupMessage, setSetupMessage] = useState('');
  const [activeTab, setActiveTab] = useState('ta');

  // Build timestamp from Vite define
  const buildDate = typeof __BUILD_DATE__ !== 'undefined' 
    ? new Date(__BUILD_DATE__).toLocaleString('ar-EG', { dateStyle: 'medium', timeStyle: 'short' })
    : 'بيئة التطوير الحية';

  const checkDbHealth = async () => {
    setDbStatus('loading');
    try {
      const response = await fetch('/api/health');
      const data = await response.json();
      if (response.ok && data.status === 'connected') {
        setDbStatus('connected');
        setDbData(data);
      } else if (data.status === 'unconfigured') {
        setDbStatus('unconfigured');
        setDbData(data);
      } else {
        setDbStatus('error');
        setDbData(data);
      }
    } catch (err) {
      setDbStatus('error');
      setDbData({ message: 'تعذر الوصول إلى الخادم أو مسار API: ' + err.message });
    }
  };

  const handleSetupDb = async () => {
    setSetupStatus('loading');
    setSetupMessage('');
    try {
      const response = await fetch('/api/setup-db', { method: 'POST' });
      const data = await response.json();
      if (response.ok && data.status === 'success') {
        setSetupStatus('success');
        setSetupMessage(data.message);
        checkDbHealth();
      } else {
        setSetupStatus('error');
        setSetupMessage(data.message || 'حدث خطأ أثناء تهيئة الجداول');
      }
    } catch (err) {
      setSetupStatus('error');
      setSetupMessage('فشل الاتصال بمسار تهيئة الجداول: ' + err.message);
    }
  };

  useEffect(() => {
    checkDbHealth();
  }, []);

  return (
    <div className="hub-container">
      {/* Background ambient glow */}
      <div className="ambient-glow cyan-glow"></div>
      <div className="ambient-glow purple-glow"></div>

      {/* Top Navbar */}
      <header className="hub-header">
        <div className="brand">
          <div className="brand-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          </div>
          <div>
            <h1 className="brand-title">TradeNov Monorepo</h1>
            <span className="brand-subtitle">المنظومة المركزية للتداول والتحليل الذكي</span>
          </div>
        </div>

        <div className="header-meta">
          <div className="badge version-badge">
            <span className="dot dot-live"></span>
            بصمة البناء: {buildDate}
          </div>
          <div className="badge stack-badge">
            ⚡ Vercel + 🐘 Neon
          </div>
        </div>
      </header>

      {/* Main Content Grid */}
      <main className="hub-content">
        {/* Neon Database Connection Card */}
        <section className="glass-card db-card">
          <div className="card-header">
            <div className="card-title-group">
              <div className="icon-badge neon-badge">🐘</div>
              <div>
                <h2>فحص اتصال قاعدة بيانات Neon</h2>
                <p className="card-desc">PostgreSQL Serverless Connection Diagnostic</p>
              </div>
            </div>
            
            <div className="status-indicator">
              {dbStatus === 'loading' && <span className="status-tag status-loading">جاري الفحص... ⏳</span>}
              {dbStatus === 'connected' && <span className="status-tag status-connected">🟢 متصل بنجاح</span>}
              {dbStatus === 'unconfigured' && <span className="status-tag status-unconfigured">⚠️ بحاجة لربط DATABASE_URL</span>}
              {dbStatus === 'error' && <span className="status-tag status-error">🔴 خطأ في الاتصال</span>}
              {dbStatus === 'idle' && <span className="status-tag">خامل</span>}
            </div>
          </div>

          <div className="db-body">
            {dbStatus === 'connected' && dbData && (
              <div className="db-info-grid">
                <div className="info-item">
                  <span className="info-label">اسم قاعدة البيانات:</span>
                  <span className="info-value highlight-cyan">{dbData.database || 'neondb'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">وقت السيرفر الحالي:</span>
                  <span className="info-value">{dbData.serverTime ? new Date(dbData.serverTime).toLocaleString('ar-EG') : '—'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">سرعة الاستجابة (Latency):</span>
                  <span className="info-value highlight-emerald">{dbData.latencyMs || '< 50'} ms</span>
                </div>
                <div className="info-item">
                  <span className="info-label">نوع المنصة:</span>
                  <span className="info-value">{dbData.platform || 'Neon Driver'}</span>
                </div>
              </div>
            )}

            {dbStatus === 'unconfigured' && (
              <div className="notice-box warning">
                <h3>خطوة الربط الأولى (Neon Setup):</h3>
                <p>1. افتح مشروعك في Neon Console وانسخ <strong>Connection String</strong>.</p>
                <p>2. أنشئ ملف <code>.env</code> وضع الرابط فيه:</p>
                <pre className="code-snippet">DATABASE_URL="postgresql://user:pass@ep-xxxx.neon.tech/neondb?sslmode=require"</pre>
                <p>3. في Vercel: أضف نفس المتغير في <strong>Settings → Environment Variables</strong>.</p>
              </div>
            )}

            {dbStatus === 'error' && dbData && (
              <div className="notice-box error">
                <p>{dbData.message}</p>
              </div>
            )}

            {setupMessage && (
              <div className={`notice-box ${setupStatus === 'success' ? 'success' : 'error'}`}>
                <p>{setupMessage}</p>
              </div>
            )}

            <div className="actions-bar">
              <button 
                className="btn btn-primary" 
                onClick={checkDbHealth} 
                disabled={dbStatus === 'loading'}
              >
                {dbStatus === 'loading' ? 'جاري الفحص...' : '🔄 إعادة فحص الاتصال'}
              </button>

              <button 
                className="btn btn-secondary" 
                onClick={handleSetupDb}
                disabled={setupStatus === 'loading' || dbStatus !== 'connected'}
                title={dbStatus !== 'connected' ? 'يجب الاتصال بقاعدة البيانات أولاً' : ''}
              >
                {setupStatus === 'loading' ? 'جاري إنشاء الجداول...' : '⚡ تهيئة وإنشاء الجداول (Schema Setup)'}
              </button>
            </div>
          </div>
        </section>

        {/* Modules Roadmap & Parallel Agents Overview */}
        <section className="glass-card modules-card">
          <div className="card-header">
            <div className="card-title-group">
              <div className="icon-badge hub-badge">🚀</div>
              <div>
                <h2>أقسام المنظومة وتوزيع الإيجنتات (Monorepo Modules)</h2>
                <p className="card-desc">مسارات العمل المتوازية وفق معايير الدستور البرمجي</p>
              </div>
            </div>

            <div className="tabs-nav">
              <button className={`tab-btn ${activeTab === 'ta' ? 'active' : ''}`} onClick={() => setActiveTab('ta')}>
                📈 TradeNov TA
              </button>
              <button className={`tab-btn ${activeTab === 'pro' ? 'active' : ''}`} onClick={() => setActiveTab('pro')}>
                💼 TradeNov PRO
              </button>
              <button className={`tab-btn ${activeTab === 'agent' ? 'active' : ''}`} onClick={() => setActiveTab('agent')}>
                🤖 TradeNov Agent
              </button>
            </div>
          </div>

          <div className="module-details">
            {activeTab === 'ta' && (
              <div className="module-box">
                <div className="module-header">
                  <span className="module-title">📈 وحدة التحليل الفني والمؤشرات (TradeNov TA)</span>
                  <span className="agent-tag">🤖 إيجنت TA</span>
                </div>
                <p className="module-text">مسؤول عن الرسوم البيانية، مستويات الدعم والمقاومة، ماسح السيولة، وإشارات التداول الفنية.</p>
                <div className="paths-list">
                  <div><strong>مسار الواجهة:</strong> <code>apps/tradenov/</code></div>
                  <div><strong>مسار الباك إند:</strong> <code>backend/modules/analysis/</code></div>
                </div>
              </div>
            )}

            {activeTab === 'pro' && (
              <div className="module-box">
                <div className="module-header">
                  <span className="module-title">💼 منصة التداول المتقدم والمحفظة (TradeNov PRO)</span>
                  <span className="agent-tag">🤖 إيجنت PRO</span>
                </div>
                <p className="module-text">مسؤول عن إدارة المحافظ، الربط مع منصات Binance / MEXC / OKX، وتنفيذ وإدارة الصفقات الحية.</p>
                <div className="paths-list">
                  <div><strong>مسار الواجهة:</strong> <code>apps/pro/</code></div>
                  <div><strong>مسار الباك إند:</strong> <code>backend/modules/portfolio/</code></div>
                </div>
              </div>
            )}

            {activeTab === 'agent' && (
              <div className="module-box">
                <div className="module-header">
                  <span className="module-title">🤖 الوكيل والمساعد الذكي المستقل (TradeNov Agent)</span>
                  <span className="agent-tag">🤖 إيجنت Agent</span>
                </div>
                <p className="module-text">مسؤول عن اتخاذ القرارات الذاتية، التنبيهات المتقدمة، وتحليل الأخبار والمشاعر في السوق.</p>
                <div className="paths-list">
                  <div><strong>مسار الواجهة:</strong> <code>apps/agent/</code></div>
                  <div><strong>مسار الباك إند:</strong> <code>backend/modules/agent/</code></div>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="hub-footer">
        <p>TradeNov System • مبني وفق الدستور الشامل لهندسة المشاريع البرمجية • Clean Code & Serverless Power</p>
      </footer>
    </div>
  );
}

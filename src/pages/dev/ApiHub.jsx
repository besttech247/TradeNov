import React, { useState } from 'react';
import { TopNav } from '../../shared/components/TopNav';
import { Button } from '../../shared/components/Button';

export default function ApiHub() {
  const [activeTab, setActiveTab] = useState('prices');
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const testApi = async (endpoint, name) => {
    setLoading(true);
    const startTime = Date.now();
    try {
      const res = await fetch(endpoint);
      const data = await res.json();
      const latency = Date.now() - startTime;
      
      const newLog = {
        id: Date.now(),
        time: new Date().toLocaleTimeString('ar-SA'),
        api: name,
        endpoint: endpoint,
        status: res.ok ? 'SUCCESS' : 'ERROR',
        latency: latency,
        response: JSON.stringify(data, null, 2)
      };
      setLogs(prev => [newLog, ...prev]);
    } catch (error) {
      const latency = Date.now() - startTime;
      const errorLog = {
        id: Date.now(),
        time: new Date().toLocaleTimeString('ar-SA'),
        api: name,
        endpoint: endpoint,
        status: 'FAILED',
        latency: latency,
        response: error.message
      };
      setLogs(prev => [errorLog, ...prev]);
    }
    setLoading(false);
  };

  const clearLogs = () => setLogs([]);

  return (
    <div className="px-4 sm:px-8 pb-8">
      <TopNav title="API Status Hub" />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        
        {/* Controls Panel */}
        <div className="glass-panel p-6 flex flex-col gap-4 h-fit">
          <h2 className="text-xl font-bold mb-2">Endpoints Test</h2>
          
          <Button 
            variant="primary" 
            onClick={() => testApi('/api/shared/prices', 'Shared Prices API')}
            disabled={loading}
          >
            جلب الأسعار الحية (Prices)
          </Button>
          
          <Button 
            variant="secondary" 
            onClick={() => testApi('/api/ta/cot', 'CFTC COT API')}
            disabled={loading}
          >
            جلب بيانات التحليل (COT)
          </Button>

          <Button 
            variant="success" 
            onClick={() => testApi('/api/health', 'System Health API')}
            disabled={loading}
          >
            فحص صحة النظام (Health)
          </Button>
          
          <hr className="border-white/10 my-2" />
          <Button variant="danger" onClick={clearLogs}>مسح السجل</Button>
        </div>

        {/* Logs Terminal */}
        <div className="lg:col-span-2 glass-panel p-6 flex flex-col h-[600px]">
          <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-4">
            <h2 className="text-xl font-bold font-mono">Terminal Logs</h2>
            <span className="text-xs text-text-muted">{logs.length} Requests</span>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
            {logs.length === 0 ? (
              <div className="h-full flex items-center justify-center text-text-muted font-mono">
                No requests sent yet. Click a button to test.
              </div>
            ) : (
              logs.map(log => (
                <div key={log.id} className="bg-background/80 border border-white/5 rounded-lg p-4 font-mono text-sm">
                  <div className="flex flex-wrap justify-between items-center mb-2 gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        log.status === 'SUCCESS' ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'
                      }`}>
                        {log.status}
                      </span>
                      <span className="text-primary font-bold">{log.api}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-text-muted">
                      <span>⏱ {log.latency}ms</span>
                      <span>⏰ {log.time}</span>
                    </div>
                  </div>
                  <div className="text-xs text-text-muted mb-2 truncate bg-white/5 px-2 py-1 rounded">
                    GET {log.endpoint}
                  </div>
                  <pre className="text-xs text-green-400 overflow-x-auto bg-black/50 p-3 rounded custom-scrollbar max-h-48">
                    {log.response}
                  </pre>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

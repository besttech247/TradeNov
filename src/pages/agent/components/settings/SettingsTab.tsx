import React, { useState } from 'react';
import { useCryptoStore } from '../../store/useCryptoStore';
import { 
  Settings, 
  Shield, 
  Bell, 
  Save, 
  Lock, 
  Smartphone, 
  Send, 
  Copy, 
  Check, 
  Flame, 
  Code, 
  Sliders, 
  Download,
  AlertOctagon,
  Volume2
} from 'lucide-react';
import { PanicModal } from '../modals/PanicModal';

export const SettingsTab: React.FC = () => {
  const { 
    telegramToken, 
    telegramChatId, 
    setTelegramSettings, 
    soundAlertsEnabled, 
    toggleSoundAlerts 
  } = useCryptoStore();

  const [tokenInput, setTokenInput] = useState(telegramToken);
  const [chatIdInput, setChatIdInput] = useState(telegramChatId);
  const [telegramAlerts, setTelegramAlerts] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [maxDailyLossPct, setMaxDailyLossPct] = useState(3.0);
  const [autoHaltTrading, setAutoHaltTrading] = useState(true);
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [copiedPayload, setCopiedPayload] = useState(false);
  const [testSent, setTestSent] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isPanicOpen, setIsPanicOpen] = useState(false);

  const webhookUrl = 'https://api.tradenov.io/v1/webhook/mexc-sniper-alpha-8821';
  const samplePayload = JSON.stringify({
    passphrase: 'mexc_secret_passphrase_88',
    ticker: '{{ticker}}',
    action: 'BUY',
    price: '{{close}}',
    strategy: 'RSI_Oversold_Signal',
    amountUsdt: 500
  }, null, 2);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setTelegramSettings(tokenInput, chatIdInput);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2200);
  };

  const handleSendTestTelegram = () => {
    setTestSent(true);
    setTimeout(() => setTestSent(false), 2500);
  };

  const handleCopyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2000);
  };

  const handleCopyPayload = () => {
    navigator.clipboard.writeText(samplePayload);
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  const handleExportCsv = () => {
    const csvContent = "data:text/csv;charset=utf-8,ID,Pair,Exchange,Type,Price,Total,Status\n" +
      "ORD-1,BTC/USDT,MEXC,BUY,63100,3155,FILLED\n" +
      "ORD-2,ETH/USDT,MEXC,BUY,3420,1710,FILLED\n" +
      "ORD-3,BTC/USDT,MEXC,SELL,63850,3192.50,FILLED";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `mexc_trading_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl">
      
      {/* Banner */}
      <div className="bg-white dark:bg-crypto-card p-6 rounded-2xl border border-jiade-border dark:border-crypto-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-jiade dark:shadow-none">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Settings className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl md:text-2xl font-extrabold text-jiade-textMain dark:text-white">
              إعدادات النظام، التلغرام، وإدارة المخاطر
            </h2>
          </div>
          <p className="text-xs md:text-sm text-jiade-textMuted dark:text-gray-400 font-medium">
            تخصيص تنبيهات التلغرام التفاعلية، ربط إشارات TradingView عبر Webhook، وضبط سقف الخسارة الطارئ.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-jiade-cardSub dark:bg-crypto-dark hover:bg-slate-200 dark:hover:bg-crypto-cardHover border border-jiade-border dark:border-crypto-border text-jiade-textMain dark:text-white text-xs font-bold transition-all shadow-sm"
          >
            <Download className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>تصدير السجل (CSV)</span>
          </button>

          <button
            onClick={() => setIsPanicOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition-all"
          >
            <Flame className="w-4 h-4" />
            <span>زر الطوارئ (Panic)</span>
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 p-3.5 rounded-xl text-xs font-bold text-center">
          ✓ تم حفظ كافة الإعدادات وربط التلغرام بنجاح!
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Section 1: Telegram Bot Integration */}
        <div className="bg-white dark:bg-crypto-card p-6 rounded-2xl border border-jiade-border dark:border-crypto-border space-y-4 shadow-jiade dark:shadow-none">
          <div className="flex items-center justify-between border-b border-jiade-border dark:border-crypto-border pb-3">
            <h3 className="text-sm font-extrabold text-jiade-textMain dark:text-white flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-blue-500" />
              <span>ربط بوت التلغرام التفاعلي (Interactive Telegram Bot)</span>
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
              تنبيهات فورية ⚡
            </span>
          </div>

          <p className="text-xs text-jiade-textMuted dark:text-gray-400 font-medium">
            استقبل إشعارات لحظية بكل صفقة شراء أو بيع يحققها البوت مع تقرير الأرباح اليومي مباشرة على هاتفك.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-jiade-textMain dark:text-gray-300 mb-1">Telegram Bot Token</label>
              <input
                type="text"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="مثال: 7192839182:AAH_..."
                className="w-full bg-jiade-cardSub dark:bg-crypto-dark border border-jiade-border dark:border-crypto-border rounded-xl px-3.5 py-2.5 text-xs text-jiade-textMain dark:text-white font-mono focus:outline-none focus:border-blue-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-jiade-textMain dark:text-gray-300 mb-1">Your Telegram Chat ID</label>
              <input
                type="text"
                value={chatIdInput}
                onChange={(e) => setChatIdInput(e.target.value)}
                placeholder="مثال: 984128491"
                className="w-full bg-jiade-cardSub dark:bg-crypto-dark border border-jiade-border dark:border-crypto-border rounded-xl px-3.5 py-2.5 text-xs text-jiade-textMain dark:text-white font-mono focus:outline-none focus:border-blue-500 font-medium"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-4 text-xs font-bold">
              <label className="flex items-center gap-2 cursor-pointer text-jiade-textMain dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={telegramAlerts}
                  onChange={(e) => setTelegramAlerts(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 cursor-pointer"
                />
                <span>تفعيل إشعارات الصفقات الرابحة</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-jiade-textMain dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={soundAlertsEnabled}
                  onChange={toggleSoundAlerts}
                  className="w-4 h-4 rounded text-blue-600 cursor-pointer"
                />
                <span className="flex items-center gap-1">
                  <Volume2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>أصوات التنبيه الحية</span>
                </span>
              </label>
            </div>

            <button
              type="button"
              onClick={handleSendTestTelegram}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-600/15 hover:bg-blue-100 dark:hover:bg-blue-600/25 text-blue-600 dark:text-blue-400 font-bold text-xs border border-blue-200 dark:border-blue-500/30 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{testSent ? '✓ تم إرسال رسالة تجريبية لهاتفك!' : 'إرسال إشعار تجريبي للتلغرام'}</span>
            </button>
          </div>
        </div>

        {/* Section 2: TradingView Webhooks */}
        <div className="bg-white dark:bg-crypto-card p-6 rounded-2xl border border-jiade-border dark:border-crypto-border space-y-4 shadow-jiade dark:shadow-none">
          <div className="flex items-center justify-between border-b border-jiade-border dark:border-crypto-border pb-3">
            <h3 className="text-sm font-extrabold text-jiade-textMain dark:text-white flex items-center gap-2">
              <Code className="w-4 h-4 text-purple-500" />
              <span>ربط إشارات TradingView المباشرة (TradingView Webhooks)</span>
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400">
              أتمتة المؤشرات
            </span>
          </div>

          <p className="text-xs text-jiade-textMuted dark:text-gray-400 font-medium">
            قم بنسخ رابط الـ Webhook الخاص بك وضعه في تنبيهات TradingView لتنفيذ أوامر الشراء والبيع الفورية على MEXC بمجرد تحقق شرط المؤشر.
          </p>

          <div>
            <label className="block text-xs font-bold text-jiade-textMain dark:text-gray-300 mb-1">رابط الـ Webhook المخصص لحسابك</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={webhookUrl}
                className="w-full bg-jiade-cardSub dark:bg-crypto-dark border border-jiade-border dark:border-crypto-border rounded-xl px-3.5 py-2.5 text-xs text-jiade-textMain dark:text-white font-mono"
              />
              <button
                type="button"
                onClick={handleCopyWebhook}
                className="px-4 py-2.5 rounded-xl bg-jiade-cardSub dark:bg-crypto-dark hover:bg-slate-200 dark:hover:bg-crypto-cardHover border border-jiade-border dark:border-crypto-border text-xs font-bold text-jiade-textMain dark:text-white flex items-center gap-1 transition-all"
              >
                {copiedWebhook ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                <span>{copiedWebhook ? 'تم النسخ' : 'نسخ'}</span>
              </button>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-jiade-textMain dark:text-gray-300">نموذج كود الرسالة (Alert Message JSON)</label>
              <button
                type="button"
                onClick={handleCopyPayload}
                className="text-[11px] text-purple-600 dark:text-purple-400 font-bold hover:underline flex items-center gap-1"
              >
                {copiedPayload ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedPayload ? 'تم النسخ' : 'نسخ الكود'}</span>
              </button>
            </div>
            <pre className="p-3 bg-jiade-cardSub dark:bg-crypto-dark border border-jiade-border dark:border-crypto-border rounded-xl text-[11px] font-mono text-jiade-textMain dark:text-gray-300 overflow-x-auto">
              {samplePayload}
            </pre>
          </div>
        </div>

        {/* Section 3: Risk Management & Daily Drawdown Guard */}
        <div className="bg-white dark:bg-crypto-card p-6 rounded-2xl border border-jiade-border dark:border-crypto-border space-y-4 shadow-jiade dark:shadow-none">
          <div className="flex items-center justify-between border-b border-jiade-border dark:border-crypto-border pb-3">
            <h3 className="text-sm font-extrabold text-jiade-textMain dark:text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>إدارة المخاطر وسقف الخسارة اليومي (Daily Drawdown Protection)</span>
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              حماية رأس المال 🛡️
            </span>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between font-bold text-jiade-textMain dark:text-gray-300 mb-1">
                <span>سقف الخسارة اليومي الأقصى (Max Daily Loss Limit)</span>
                <span className="text-rose-600 dark:text-rose-400 font-mono font-bold">{maxDailyLossPct}% من إجمالي المحفظة</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="0.5"
                value={maxDailyLossPct}
                onChange={(e) => setMaxDailyLossPct(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-jiade-border dark:bg-crypto-border rounded-lg appearance-none cursor-pointer accent-rose-600"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-jiade-cardSub dark:bg-crypto-dark border border-jiade-border dark:border-crypto-border">
              <div>
                <h4 className="font-bold text-jiade-textMain dark:text-white">التجميد التلقائي للتداول عند بلوغ سقف الخسارة</h4>
                <p className="text-[11px] text-jiade-textMuted dark:text-gray-400">إيقاف كافة البوتات حتى بداية اليوم التالي لمنع تفاقم الخسائر في الأيام العاصفة.</p>
              </div>
              <input
                type="checkbox"
                checked={autoHaltTrading}
                onChange={(e) => setAutoHaltTrading(e.target.checked)}
                className="w-5 h-5 rounded text-rose-600 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>حفظ كافة الإعدادات</span>
          </button>
        </div>

      </form>

      {/* Panic Modal Component */}
      <PanicModal 
        isOpen={isPanicOpen}
        onClose={() => setIsPanicOpen(false)}
      />

    </div>
  );
};

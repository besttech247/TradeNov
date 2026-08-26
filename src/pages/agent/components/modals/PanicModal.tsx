import React, { useState } from 'react';
import { useCryptoStore } from '../../store/useCryptoStore';
import { 
  AlertTriangle, 
  X, 
  PauseCircle, 
  XCircle, 
  Flame, 
  CheckCircle2, 
  ShieldAlert,
  Zap,
  Target
} from 'lucide-react';

interface PanicModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PanicModal: React.FC<PanicModalProps> = ({ isOpen, onClose }) => {
  const { 
    pauseAllBots, 
    cancelAllOrders, 
    panicEmergencyClose, 
    panicSellAllMarket, 
    panicSellAllLimit 
  } = useCryptoStore();

  const [confirmedAction, setConfirmedAction] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAction = (type: 'pause' | 'cancel' | 'market_sell' | 'limit_sell' | 'liquidate') => {
    if (type === 'pause') {
      pauseAllBots();
      setConfirmedAction('تم إيقاف تشغيل كافة البوتات مؤقتاً لحماية الأرباح!');
    } else if (type === 'cancel') {
      cancelAllOrders();
      setConfirmedAction('تم إلغاء كافة الأوامر المعلقة في المنصات فوراً!');
    } else if (type === 'market_sell') {
      panicSellAllMarket();
      setConfirmedAction('تم تنفيذ أمر بيع فوري بسعر السوق (Market Sell) وتحويل جميع الأصول إلى USDT بنجاح!');
    } else if (type === 'limit_sell') {
      panicSellAllLimit();
      setConfirmedAction('تم وضع أوامر بيع محددة (Limit Sell) عند أفضل سعر طلب لجميع الأصول!');
    } else if (type === 'liquidate') {
      panicEmergencyClose();
      setConfirmedAction('تم إيقاف النظام بالكامل وتجميد التداول وتصفية الأوامر!');
    }

    setTimeout(() => {
      setConfirmedAction(null);
      onClose();
    }, 2400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-white dark:bg-crypto-card border border-rose-500/40 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-rose-600 p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">مركز الطوارئ والبيع السريع (Emergency Actions)</h3>
              <p className="text-[11px] text-white/80">إيقاف التداول والبيع الفوري عبر أوامر السوق أو الأوامر المحددة</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/20"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          
          {confirmedAction ? (
            <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 p-4 rounded-xl text-center font-bold text-sm flex items-center justify-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              <span>{confirmedAction}</span>
            </div>
          ) : (
            <>
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-800 dark:text-amber-300 text-xs font-medium flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 shrink-0 text-amber-500" />
                <span>اختر نوع البيع أو الإيقاف المناسب لتطبيقه على كافة المحافظ والمنصات المتصلة فوراً.</span>
              </div>

              <div className="space-y-3 pt-2">
                
                {/* 1. Market Sell Everything */}
                <button
                  onClick={() => handleAction('market_sell')}
                  className="w-full p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/40 border border-rose-300 dark:border-rose-800 flex items-center justify-between group transition-all text-right"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-xs text-rose-700 dark:text-rose-400">إيقاف وبيع فوري بسعر السوق (Market Order)</h4>
                      <p className="text-[11px] text-rose-600/80 dark:text-rose-300/80">بيع جميع العملات فوراً بأعلى سرعة وتحويلها لـ USDT.</p>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold px-2.5 py-1 rounded-lg bg-rose-600 text-white shadow-sm">ماركت اردر ⚡</span>
                </button>

                {/* 2. Limit Sell Everything */}
                <button
                  onClick={() => handleAction('limit_sell')}
                  className="w-full p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/30 hover:bg-blue-100 dark:hover:bg-blue-900/40 border border-blue-300 dark:border-blue-800 flex items-center justify-between group transition-all text-right"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
                      <Target className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-xs text-blue-700 dark:text-blue-400">إيقاف وبيع ذكي بأمر محدد (Limit Order)</h4>
                      <p className="text-[11px] text-blue-600/80 dark:text-blue-300/80">وضع طلبات بيع محددة عند أفضل سعر لتجنب الانزلاق.</p>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold px-2.5 py-1 rounded-lg bg-blue-600 text-white shadow-sm">لمت اردر 🎯</span>
                </button>

                {/* 3. Pause Bots */}
                <button
                  onClick={() => handleAction('pause')}
                  className="w-full p-3.5 rounded-xl bg-jiade-cardSub dark:bg-crypto-dark hover:bg-slate-200 dark:hover:bg-crypto-cardHover border border-jiade-border dark:border-crypto-border flex items-center justify-between group transition-all text-right"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <PauseCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-jiade-textMain dark:text-white">إيقاف مؤقت لكافة البوتات (Pause Bots)</h4>
                      <p className="text-[11px] text-jiade-textMuted dark:text-gray-400">تجميد الصفقات الجديدة مع إبقاء الأوامر الحالية دون بيع.</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400">إيقاف ⏸</span>
                </button>

                {/* 4. Cancel Orders */}
                <button
                  onClick={() => handleAction('cancel')}
                  className="w-full p-3.5 rounded-xl bg-jiade-cardSub dark:bg-crypto-dark hover:bg-slate-200 dark:hover:bg-crypto-cardHover border border-jiade-border dark:border-crypto-border flex items-center justify-between group transition-all text-right"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gray-500/15 text-gray-600 dark:text-gray-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <XCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-jiade-textMain dark:text-white">إلغاء كافة الأوامر المعلقة (Cancel Orders)</h4>
                      <p className="text-[11px] text-jiade-textMuted dark:text-gray-400">إلغاء جميع طلبات الشراء والبيع في دفتر الطلبات.</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-gray-600 dark:text-gray-400">إلغاء ✕</span>
                </button>

              </div>
            </>
          )}

        </div>

      </div>
    </div>
  );
};

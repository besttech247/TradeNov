import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Factory, Plus, Edit, Trash2, ShieldAlert, Target, Zap, Gem, XCircle } from 'lucide-react';

export default function StrategyFactoryPage() {
  const { strategies, addStrategy, updateStrategy, deleteStrategy, fetchData, exchanges, t } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editingStrategyId, setEditingStrategyId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    category: 'Short-Term',
    default_exchange_id: exchanges[0]?.id || 1,
    default_order_type: 'Limit',
    tp_rules: [
      { stage: 1, gain_pct: 3.0, sell_portion_pct: 50.0 },
      { stage: 2, gain_pct: 6.0, sell_portion_pct: 30.0 },
      { stage: 3, gain_pct: 10.0, sell_portion_pct: 20.0 }
    ],
    sl_rules: [
      { stage: 1, loss_pct: 2.5, sell_portion_pct: 100.0 }
    ]
  });

  const handleOpenAddModal = () => {
    setEditingStrategyId(null);
    setFormData({
      name: '',
      category: 'Short-Term',
      default_exchange_id: exchanges[0]?.id || 1,
      default_order_type: 'Limit',
      tp_rules: [
        { stage: 1, gain_pct: 3.0, sell_portion_pct: 50.0 },
        { stage: 2, gain_pct: 6.0, sell_portion_pct: 30.0 },
        { stage: 3, gain_pct: 10.0, sell_portion_pct: 20.0 }
      ],
      sl_rules: [
        { stage: 1, loss_pct: 2.5, sell_portion_pct: 100.0 }
      ]
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (strat) => {
    setEditingStrategyId(strat.id);
    setFormData({
      name: strat.name,
      category: strat.category,
      default_exchange_id: strat.default_exchange_id || exchanges[0]?.id || 1,
      default_order_type: strat.default_order_type || 'Limit',
      tp_rules: strat.tp_rules ? [...strat.tp_rules] : [{ stage: 1, gain_pct: 3.0, sell_portion_pct: 50.0 }],
      sl_rules: strat.sl_rules ? [...strat.sl_rules] : [{ stage: 1, loss_pct: 2.5, sell_portion_pct: 100.0 }]
    });
    setShowModal(true);
  };

  const handleTpChange = (index, field, value) => {
    const updated = [...formData.tp_rules];
    updated[index][field] = parseFloat(value) || 0;
    setFormData({ ...formData, tp_rules: updated });
  };

  const addTpStage = () => {
    setFormData({
      ...formData,
      tp_rules: [
        ...formData.tp_rules,
        { stage: formData.tp_rules.length + 1, gain_pct: 5.0, sell_portion_pct: 20.0 }
      ]
    });
  };

  const removeTpStage = (index) => {
    const updated = formData.tp_rules.filter((_, i) => i !== index).map((item, idx) => ({ ...item, stage: idx + 1 }));
    setFormData({ ...formData, tp_rules: updated });
  };

  const handleSlChange = (index, field, value) => {
    const updated = [...formData.sl_rules];
    updated[index][field] = parseFloat(value) || 0;
    setFormData({ ...formData, sl_rules: updated });
  };

  const addSlStage = () => {
    setFormData({
      ...formData,
      sl_rules: [
        ...formData.sl_rules,
        { stage: formData.sl_rules.length + 1, loss_pct: 3.0, sell_portion_pct: 100.0 }
      ]
    });
  };

  const removeSlStage = (index) => {
    const updated = formData.sl_rules.filter((_, i) => i !== index).map((item, idx) => ({ ...item, stage: idx + 1 }));
    setFormData({ ...formData, sl_rules: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      if (editingStrategyId) {
        await updateStrategy({ ...formData, id: editingStrategyId });
      } else {
        await addStrategy(formData);
      }
      await fetchData();
      setShowModal(false);
    } catch (err) {
      alert(err.message || 'Error saving strategy');
    }
  };

  const handleDeleteStrategy = async (id) => {
    if (!window.confirm(t('confirmDelete') || 'هل أنت متأكد من حذف هذا العنصر؟')) return;
    try {
      await deleteStrategy(id);
      await fetchData();
      setShowModal(false);
    } catch (err) {
      alert(err.message || 'Error deleting strategy');
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-4 sm:p-6 rounded-2xl border border-white/10">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Factory className="w-6 h-6 text-indigo-400 shrink-0" />
            <span>{t('strategyFactoryTitle')}</span>
          </h2>
          <p className="text-sm text-gray-400 mt-1">{t('strategyFactoryDesc')}</p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white text-sm font-bold shadow-lg shadow-indigo-500/20 transition-all duration-200 shrink-0"
        >
          <Plus className="w-4 h-4 shrink-0" />
          <span>{t('addStrategyModalTitle')}</span>
        </button>
      </div>

      {/* Existing Strategies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {strategies.map((strat) => (
          <div key={strat.id} className="glass-panel p-4 sm:p-6 rounded-2xl border border-white/10 space-y-4 hover:border-indigo-500/40 transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-3 truncate min-w-0">
                  <div className={`p-2.5 rounded-xl shrink-0 ${strat.category === 'Short-Term' ? 'bg-amber-500/10 text-amber-400' : 'bg-purple-500/10 text-purple-400'}`}>
                    {strat.category === 'Short-Term' ? <Zap className="w-5 h-5" /> : <Gem className="w-5 h-5" />}
                  </div>
                  <div className="truncate min-w-0">
                    <h3 className="text-base font-bold text-white truncate">{strat.name}</h3>
                    <span className="text-xs font-mono text-gray-400 block truncate">
                      {strat.category === 'Short-Term' ? t('categoryShortTerm') : t('categoryLongTerm')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-white/5 border border-white/10 text-cyan-300">
                    {strat.default_order_type}
                  </span>
                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEditModal(strat)}
                      className="flex items-center justify-center p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-cyan-300 hover:text-white transition-all"
                      title={t('actionEdit')}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* TP Array Table */}
              <div>
                <h4 className="text-xs font-bold text-emerald-400 mb-2 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 shrink-0" />
                  <span>{t('tpLevels')}</span>
                </h4>
                <div className="space-y-1.5">
                  {strat.tp_rules?.map((tp) => (
                    <div key={tp.stage} className="flex items-center justify-between p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10 text-xs font-mono" dir="ltr">
                      <span className="text-gray-300">Stage {tp.stage}: +{tp.gain_pct}% Gain</span>
                      <span className="text-emerald-400 font-bold">Sell {tp.sell_portion_pct}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* SL Array Table */}
              <div>
                <h4 className="text-xs font-bold text-rose-400 mb-2 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                  <span>{t('slLevels')}</span>
                </h4>
                <div className="space-y-1.5">
                  {strat.sl_rules?.map((sl) => (
                    <div key={sl.stage} className="flex items-center justify-between p-2 rounded-lg bg-rose-500/5 border border-rose-500/10 text-xs font-mono" dir="ltr">
                      <span className="text-gray-300">Stage {sl.stage}: -{sl.loss_pct}% Loss</span>
                      <span className="text-rose-400 font-bold">Sell {sl.sell_portion_pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Strategy Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md overflow-y-auto">
          <div className="glass-panel w-full max-w-2xl p-4 sm:p-6 rounded-2xl border border-white/20 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Factory className="w-5 h-5 text-indigo-400 shrink-0" />
                <span>{editingStrategyId ? 'تعديل بيانات الاستراتيجية' : t('addStrategyModalTitle')}</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 mb-1">{t('strategyName')}</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. سوينغ المرتدات 1:2.5"
                    required
                    className="w-full p-2.5 rounded-xl glass-input"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-1">{t('category')}</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-2.5 rounded-xl glass-input text-white"
                  >
                    <option value="Short-Term" className="bg-gray-900">{t('categoryShortTerm')}</option>
                    <option value="Long-Term" className="bg-gray-900">{t('categoryLongTerm')}</option>
                  </select>
                </div>
              </div>

              {/* Order Type & Exchange */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 mb-1">{t('defaultExchange')}</label>
                  <select
                    value={formData.default_exchange_id}
                    onChange={(e) => setFormData({ ...formData, default_exchange_id: parseInt(e.target.value) })}
                    className="w-full p-2.5 rounded-xl glass-input text-white"
                  >
                    {exchanges.map((ex) => (
                      <option key={ex.id} value={ex.id} className="bg-gray-900">
                        {ex.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-300 mb-1">{t('defaultOrderType')}</label>
                  <select
                    value={formData.default_order_type}
                    onChange={(e) => setFormData({ ...formData, default_order_type: e.target.value })}
                    className="w-full p-2.5 rounded-xl glass-input text-white"
                  >
                    <option value="Limit" className="bg-gray-900">Limit</option>
                    <option value="Market" className="bg-gray-900">Market</option>
                    <option value="Stop-Limit" className="bg-gray-900">Stop-Limit</option>
                  </select>
                </div>
              </div>

              {/* Dynamic TP Array Builder */}
              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <Target className="w-4 h-4 shrink-0" />
                    <span>{t('tpLevels')}</span>
                  </h4>
                  <button
                    type="button"
                    onClick={addTpStage}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 text-[11px] hover:bg-emerald-500/30 font-bold shrink-0"
                  >
                    <Plus className="w-3 h-3 shrink-0" />
                    <span>{t('addTpStageBtn')}</span>
                  </button>
                </div>

                {formData.tp_rules.map((tp, idx) => (
                  <div key={idx} className="grid grid-cols-7 gap-2 items-center text-xs">
                    <span className="col-span-1 font-mono text-gray-400">S{tp.stage}</span>
                    <div className="col-span-3">
                      <input
                        type="number"
                        step="0.5"
                        placeholder="Gain %"
                        value={tp.gain_pct}
                        onChange={(e) => handleTpChange(idx, 'gain_pct', e.target.value)}
                        className="w-full p-2 rounded-lg glass-input font-mono text-emerald-400"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        step="5"
                        placeholder="Portion %"
                        value={tp.sell_portion_pct}
                        onChange={(e) => handleTpChange(idx, 'sell_portion_pct', e.target.value)}
                        className="w-full p-2 rounded-lg glass-input font-mono text-emerald-400"
                      />
                    </div>
                    <div className="col-span-1 text-right">
                      {formData.tp_rules.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeTpStage(idx)}
                          className="p-1.5 text-rose-400 hover:bg-rose-500/20 rounded-lg"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Dynamic SL Array Builder */}
              <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-rose-400 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    <span>{t('slLevels')}</span>
                  </h4>
                  <button
                    type="button"
                    onClick={addSlStage}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 text-[11px] hover:bg-rose-500/30 font-bold shrink-0"
                  >
                    <Plus className="w-3 h-3 shrink-0" />
                    <span>{t('addSlStageBtn')}</span>
                  </button>
                </div>

                {formData.sl_rules.map((sl, idx) => (
                  <div key={idx} className="grid grid-cols-7 gap-2 items-center text-xs">
                    <span className="col-span-1 font-mono text-gray-400">S{sl.stage}</span>
                    <div className="col-span-3">
                      <input
                        type="number"
                        step="0.5"
                        placeholder="Loss %"
                        value={sl.loss_pct}
                        onChange={(e) => handleSlChange(idx, 'loss_pct', e.target.value)}
                        className="w-full p-2 rounded-lg glass-input font-mono text-rose-400"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        step="5"
                        placeholder="Portion %"
                        value={sl.sell_portion_pct}
                        onChange={(e) => handleSlChange(idx, 'sell_portion_pct', e.target.value)}
                        className="w-full p-2 rounded-lg glass-input font-mono text-rose-400"
                      />
                    </div>
                    <div className="col-span-1 text-right">
                      {formData.sl_rules.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeSlStage(idx)}
                          className="p-1.5 text-rose-400 hover:bg-rose-500/20 rounded-lg"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between gap-3 pt-3 border-t border-white/10">
                {editingStrategyId ? (
                  <button
                    type="button"
                    onClick={() => handleDeleteStrategy(editingStrategyId)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 font-sans font-semibold border border-red-500/20 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>{t('actionDelete')}</span>
                  </button>
                ) : (
                  <div></div>
                )}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded-xl bg-white/5 text-gray-300 hover:bg-white/10 font-sans"
                  >
                    {t('actionCancel')}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold font-sans"
                  >
                    {t('actionSave')}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

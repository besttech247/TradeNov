/**
 * Spot Trading & Portfolio Intelligence Platform
 * Mathematical Engine & Calculations
 */

/**
 * Smart formatting for crypto prices dynamically scaling decimals
 */
export function formatCryptoPrice(price) {
  const num = parseFloat(price);
  if (isNaN(num) || num === 0) return '0.00';
  
  if (num >= 1000) return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (num >= 1) return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
  if (num >= 0.01) return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
  if (num >= 0.0001) return num.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 6 });
  return num.toLocaleString('en-US', { minimumFractionDigits: 6, maximumFractionDigits: 10 });
}

/**
 * Calculates effective fee percentage based on base fee and discount token rules
 */
export function calculateEffectiveFeePct(baseFeePct, useDiscountToken, discountPct) {
  const base = parseFloat(baseFeePct) || 0;
  if (!useDiscountToken) return base;
  const disc = parseFloat(discountPct) || 0;
  return base * (1 - disc / 100);
}

/**
 * Calculates trade purchase details and fee
 */
export function calculateTradePurchase({ amountUsd, entryPrice, feePct }) {
  const amount = parseFloat(amountUsd) || 0;
  const price = parseFloat(entryPrice) || 0;
  if (amount <= 0 || price <= 0) {
    return { quantity: 0, feeUsd: 0, netInvested: 0 };
  }
  const quantity = amount / price;
  const feeUsd = amount * ((parseFloat(feePct) || 0) / 100);
  const netInvested = amount + feeUsd;
  return { quantity, feeUsd, netInvested };
}

/**
 * Automatically generates TP (Take Profit) and SL (Stop Loss) targets from Strategy rules
 */
export function generateTradeTargets({ entryPrice, amountUsd, quantity, tpRules = [], slRules = [] }) {
  const price = parseFloat(entryPrice) || 0;
  const amount = parseFloat(amountUsd) || 0;
  if (price <= 0 || (amount <= 0 && !quantity)) return { tpTargets: [], slTargets: [] };

  const totalQuantity = quantity !== undefined ? parseFloat(quantity) : (amount / price);

  const tpTargets = (tpRules || []).map((rule) => {
    const gainPct = parseFloat(rule.gain_pct) || 0;
    const sellPortionPct = parseFloat(rule.sell_portion_pct) || 0;
    const targetPrice = price * (1 + gainPct / 100);
    const quantityToSell = totalQuantity * (sellPortionPct / 100);
    const expectedProceeds = targetPrice * quantityToSell;
    const expectedGainUsd = expectedProceeds - price * quantityToSell;

    return {
      stage: rule.stage,
      type: 'TP',
      gainPct,
      sellPortionPct,
      targetPrice,
      quantityToSell,
      expectedProceeds,
      expectedGainUsd,
      status: 'PENDING'
    };
  });

  const slTargets = (slRules || []).map((rule) => {
    const lossPct = parseFloat(rule.loss_pct) || 0;
    const sellPortionPct = parseFloat(rule.sell_portion_pct) || 0;
    const targetPrice = price * (1 - lossPct / 100);
    const quantityToSell = totalQuantity * (sellPortionPct / 100);
    const expectedProceeds = targetPrice * quantityToSell;
    const expectedLossUsd = price * quantityToSell - expectedProceeds;

    return {
      stage: rule.stage,
      type: 'SL',
      lossPct,
      sellPortionPct,
      targetPrice,
      quantityToSell,
      expectedProceeds,
      expectedLossUsd,
      status: 'PENDING'
    };
  });

  return { tpTargets, slTargets };
}

/**
 * Calculates Portfolio Metrics for a coin symbol
 */
export function calculateCoinPortfolio({ trades = [], livePrices = {} }) {
  const portfolioMap = {};

  trades.forEach((trade) => {
    const symbol = trade.symbol.toUpperCase();
    const key = `${symbol}_${trade.exchange_id}_${trade.strategy_id}`;

    if (!portfolioMap[key]) {
      portfolioMap[key] = {
        symbol,
        exchange_id: trade.exchange_id,
        exchange_name: trade.exchange_name,
        strategy_id: trade.strategy_id,
        strategy_name: trade.strategy_name,
        category: trade.category || 'Short-Term',
        totalBuyQuantity: 0,
        totalBuyCostUsd: 0,
        totalBuyFeesUsd: 0,
        totalSoldQuantity: 0,
        realizedPnlUsd: 0,
        totalFeesPaidUsd: 0,
        totalProceedsUsd: 0,
      };
    }

    const item = portfolioMap[key];
    const qty = parseFloat(trade.quantity) || 0;
    const price = parseFloat(trade.entry_price) || 0;
    const fee = parseFloat(trade.calculated_fee) || 0;

    item.totalBuyQuantity += qty;
    item.totalBuyCostUsd += qty * price;
    item.totalBuyFeesUsd += fee;
    item.totalFeesPaidUsd += fee;

    // Process executed sell targets if any
    if (trade.targets && Array.isArray(trade.targets)) {
      trade.targets.forEach((tgt) => {
        if (tgt.status === 'EXECUTED') {
          const soldQty = parseFloat(tgt.quantity_to_sell) || 0;
          const sellPrice = parseFloat(tgt.target_price) || 0;
          const sellFee = parseFloat(tgt.executed_fee) || 0; // If you ever add it to backend
          item.totalSoldQuantity += soldQty;
          item.totalFeesPaidUsd += sellFee;

          // Average cost remains constant for sold items
          const avgCost = item.totalBuyQuantity > 0 ? (item.totalBuyCostUsd + item.totalBuyFeesUsd) / item.totalBuyQuantity : 0;
          const costOfSold = soldQty * avgCost;
          const grossProceeds = soldQty * sellPrice - sellFee;
          item.realizedPnlUsd += grossProceeds - costOfSold;
          item.totalProceedsUsd += grossProceeds;
        }
      });
    }
  });

  // Calculate final numbers per asset
  return Object.values(portfolioMap).map((item) => {
    const currentQuantity = Math.max(0, item.totalBuyQuantity - item.totalSoldQuantity);
    
    // Average Cost Formula: (SUM(Buy Qty * Buy Price + Fees)) / SUM(Buy Qty)
    const averageCost = item.totalBuyQuantity > 0 
      ? (item.totalBuyCostUsd + item.totalBuyFeesUsd) / item.totalBuyQuantity 
      : 0;

    const totalInvestedRemaining = currentQuantity * averageCost;
    
    // Fetch live price
    const livePrice = livePrices[item.symbol] || livePrices[`${item.symbol}USDT`] || averageCost;
    const currentValue = currentQuantity * livePrice;
    const unrealizedPnlUsd = currentValue - totalInvestedRemaining;
    const unrealizedPnlPct = totalInvestedRemaining > 0 ? (unrealizedPnlUsd / totalInvestedRemaining) * 100 : 0;

    return {
      ...item,
      currentQuantity,
      averageCost,
      totalInvestedRemaining,
      livePrice,
      currentValue,
      unrealizedPnlUsd,
      unrealizedPnlPct,
      totalBuyCostUsd: item.totalBuyCostUsd,
      totalBuyFeesUsd: item.totalBuyFeesUsd,
      totalProceedsUsd: item.totalProceedsUsd,
      breakEvenPrice: averageCost // For spot trading
    };
  });
}

/**
 * Calculates Overview Dashboard Global Summaries
 */
export function calculateOverviewMetrics({ exchanges = [], coinPortfolios = [] }) {
  let initialCash = 0;
  let totalInvestedValue = 0;
  let totalFeesPaidUsd = 0;
  let totalUnrealizedPnlUsd = 0;
  let totalRealizedPnlUsd = 0;
  let totalPurchases = 0;
  let totalSales = 0;

  // Initial Cash and Wallet flows per exchange
  let totalDeposits = 0;
  let totalWithdrawals = 0;
  let totalTransfersIn = 0;
  let totalTransfersOut = 0;

  exchanges.forEach((ex) => {
    initialCash += parseFloat(ex.initial_cash_balance) || 0;
    totalDeposits += parseFloat(ex.total_deposits) || 0;
    totalWithdrawals += parseFloat(ex.total_withdrawals) || 0;
    totalTransfersIn += parseFloat(ex.total_transfers_in) || 0;
    totalTransfersOut += parseFloat(ex.total_transfers_out) || 0;
  });

  coinPortfolios.forEach((item) => {
    totalPurchases += (item.totalBuyCostUsd || 0) + (item.totalBuyFeesUsd || 0);
    totalSales += (item.totalProceedsUsd || 0);

    totalInvestedValue += item.currentValue;
    totalFeesPaidUsd += item.totalFeesPaidUsd;
    totalUnrealizedPnlUsd += item.unrealizedPnlUsd;
    totalRealizedPnlUsd += item.realizedPnlUsd;
  });

  // Wallet adjustments
  const netWalletFlow = totalDeposits - totalWithdrawals + totalTransfersIn - totalTransfersOut;

  // We DO NOT cap at 0 anymore (Flexible Mode). Negative cash indicates an unlogged deposit!
  const totalCashBalance = initialCash + netWalletFlow - totalPurchases + totalSales;
  
  // Total Portfolio Value (Net Worth) is theoretically the same. If cash is negative, it subtracts from invested value.
  const totalPortfolioValue = totalCashBalance + totalInvestedValue;
  const hasNegativeCash = totalCashBalance < 0;
  const unloggedDepositAmount = hasNegativeCash ? Math.abs(totalCashBalance) : 0;

  // For percentages, if cash is negative, we can't really do standard pie charts, so we cap at 0 for visual percentages
  const visualCash = Math.max(0, totalCashBalance);
  const visualPortfolio = visualCash + totalInvestedValue;
  const cashPct = visualPortfolio > 0 ? (visualCash / visualPortfolio) * 100 : 0;
  const investedPct = visualPortfolio > 0 ? (totalInvestedValue / visualPortfolio) * 100 : 0;

  return {
    totalPortfolioValue,
    totalCashBalance,
    totalInvestedValue,
    cashPct,
    investedPct,
    totalFeesPaidUsd,
    totalUnrealizedPnlUsd,
    totalRealizedPnlUsd,
    hasNegativeCash,
    unloggedDepositAmount
  };
}

/**
 * Calculates the real-time cash balance for a specific exchange
 */
export function calculateExchangeLiveBalance(exchange, trades = []) {
  const exTrades = trades.filter(t => t.exchange_id === exchange.id);
  let totalPurchases = 0;
  let totalSales = 0;
  
  exTrades.forEach(t => {
    const qty = parseFloat(t.quantity) || 0;
    const price = parseFloat(t.entry_price) || 0;
    const fee = parseFloat(t.calculated_fee) || 0;
    
    totalPurchases += (qty * price) + fee;
    
    if (t.targets && Array.isArray(t.targets)) {
      t.targets.forEach(tgt => {
        if (tgt.status === 'EXECUTED') {
          const soldQty = parseFloat(tgt.quantity_to_sell) || 0;
          const sellPrice = parseFloat(tgt.target_price) || 0;
          const sellFee = parseFloat(tgt.executed_fee) || 0;
          
          totalSales += (soldQty * sellPrice) - sellFee;
        }
      });
    }
  });

  const initial = parseFloat(exchange.initial_cash_balance) || 0;
  const deposits = parseFloat(exchange.total_deposits) || 0;
  const withdrawals = parseFloat(exchange.total_withdrawals) || 0;
  const transfersIn = parseFloat(exchange.total_transfers_in) || 0;
  const transfersOut = parseFloat(exchange.total_transfers_out) || 0;
  
  const liveCash = initial + deposits - withdrawals + transfersIn - transfersOut - totalPurchases + totalSales;
  
  return liveCash;
}

export function calculateTradeRealizedPnl(t) {
  if (t.status !== 'CLOSED' && t.status !== 'PARTIALLY_CLOSED') return 0;
  
  let realizedPnl = 0;
  let totalSoldQty = 0;
  let totalProceeds = 0;
  let totalSellFees = 0;
  
  if (t.targets && Array.isArray(t.targets)) {
    t.targets.forEach((tgt) => {
      if (tgt.status === 'EXECUTED') {
        const qty = parseFloat(tgt.quantity_to_sell) || parseFloat(tgt.quantityToSell) || 0;
        const price = parseFloat(tgt.target_price) || parseFloat(tgt.targetPrice) || 0;
        const fee = parseFloat(tgt.executed_fee) || parseFloat(tgt.executedFee) || 0;
        totalSoldQty += qty;
        totalProceeds += (qty * price);
        totalSellFees += fee;
      }
    });
  }
  
  const costOfSold = totalSoldQty * (parseFloat(t.entry_price) || 0);
  const buyFee = parseFloat(t.calculated_fee) || 0;
  
  // Proportional buy fee based on sold qty vs total qty
  const totalQty = parseFloat(t.quantity) || 1;
  const propBuyFee = (totalSoldQty / totalQty) * buyFee;
  
  realizedPnl = totalProceeds - costOfSold - totalSellFees - propBuyFee;
  return realizedPnl;
}

/**
 * Calculates Short-Term Trading Metrics (Win Rate, Profit Factor, etc.)
 */
export function calculateShortTermMetrics(trades = []) {
  const shortTermTrades = trades.filter((t) => t.category === 'Short-Term' || !t.category);
  
  let winsCount = 0;
  let lossesCount = 0;
  let totalWinUsd = 0;
  let totalLossUsd = 0;

  shortTermTrades.forEach((t) => {
    if (t.status === 'CLOSED') {
      const realizedPnl = calculateTradeRealizedPnl(t);

      if (realizedPnl > 0) {
        winsCount++;
        totalWinUsd += realizedPnl;
      } else if (realizedPnl <= 0) {
        lossesCount++;
        totalLossUsd += Math.abs(realizedPnl);
      }
    }
  });

  const totalClosed = winsCount + lossesCount;
  const winRatePct = totalClosed > 0 ? (winsCount / totalClosed) * 100 : 0;
  const profitFactor = totalLossUsd > 0 ? totalWinUsd / totalLossUsd : totalWinUsd > 0 ? totalWinUsd : 0;
  const avgWinUsd = winsCount > 0 ? totalWinUsd / winsCount : 0;
  const avgLossUsd = lossesCount > 0 ? totalLossUsd / lossesCount : 0;

  return {
    totalClosed,
    winsCount,
    lossesCount,
    winRatePct,
    profitFactor,
    totalWinUsd,
    totalLossUsd,
    avgWinUsd,
    avgLossUsd
  };
}

export function convertArabicNumerals(str) {
  if (!str) return str;
  const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return String(str).replace(/[٠-٩]/g, function(w) {
    return arabicNumbers.indexOf(w);
  }).replace(/٫/g, '.'); // Convert Arabic decimal comma to dot
}

export function formatInputWithCommas(val) {
  if (val === undefined || val === null || val === '') return '';
  const normalized = convertArabicNumerals(val);
  const clean = normalized.replace(/,/g, '');
  if (isNaN(clean) && clean !== '.') return normalized;
  const parts = clean.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
}

export function parseCommasToNumber(val) {
  if (!val) return 0;
  const normalized = convertArabicNumerals(val);
  const clean = normalized.replace(/,/g, '');
  return parseFloat(clean) || 0;
}

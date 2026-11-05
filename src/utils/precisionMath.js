/**
 * precisionMath.js
 * High-Precision Jewelry Calculations using Decimal.js
 * Solves all floating-point precision issues (0.1 + 0.2 != 0.3) in gold manufacturing.
 */

import Decimal from 'decimal.js';

// Configure Decimal for jewelry ERP: 20 digits precision, standard rounding
Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

/**
 * Event handler to prevent typing '-', '+', 'e', 'E' in numeric inputs
 */
export function preventNegativeKey(e) {
  if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '+') {
    e.preventDefault();
  }
}

/**
 * Sanitize non-negative input string value
 */
export function sanitizeNonNegative(val) {
  if (val === '' || val === null || val === undefined) return '';
  const num = parseFloat(val);
  if (isNaN(num) || num < 0) return '';
  return val;
}

/**
 * Sanitize and enforce positive number (>= 0).
 * Prevents negative numbers, NaN, and malformed inputs.
 */
export function sanitizePositiveNumber(val, fallback = 0) {
  if (val === null || val === undefined || val === '') return fallback;
  try {
    const d = new Decimal(val);
    if (d.isNaN() || !d.isFinite()) return fallback;
    return d.isNegative() ? fallback : d.toNumber();
  } catch {
    return fallback;
  }
}

/**
 * Parse weight string/number strictly to Decimal.
 * Automatically clamps negative values to 0.
 */
export function toDecimal(val) {
  if (val === null || val === undefined || val === '') return new Decimal(0);
  try {
    const d = new Decimal(val);
    if (d.isNaN() || !d.isFinite() || d.isNegative()) return new Decimal(0);
    return d;
  } catch {
    return new Decimal(0);
  }
}

/**
 * Round weight to 3 decimal places (milligram standard in jewelry: 0.001 gr)
 */
export function roundWeight(val) {
  return toDecimal(val).toDecimalPlaces(3, Decimal.ROUND_HALF_UP).toNumber();
}

/**
 * Round currency to 2 decimal places ($0.01)
 */
export function roundCurrency(val) {
  return toDecimal(val).toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber();
}

/**
 * Round percentage to 2 decimal places (0.01%)
 */
export function roundPercent(val) {
  return toDecimal(val).toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber();
}

/**
 * High-precision weight addition: sum(weights...)
 */
export function addWeights(...weights) {
  let total = new Decimal(0);
  for (const w of weights) {
    total = total.plus(toDecimal(w));
  }
  return total.toDecimalPlaces(3, Decimal.ROUND_HALF_UP).toNumber();
}

/**
 * High-precision weight subtraction: a - b
 * Clamped to 0 if result is negative (unless allowNegative is true)
 */
export function subtractWeights(a, b, allowNegative = false) {
  const res = toDecimal(a).minus(toDecimal(b));
  if (!allowNegative && res.isNegative()) {
    return 0;
  }
  return res.toDecimalPlaces(3, Decimal.ROUND_HALF_UP).toNumber();
}

/**
 * Calculate Pure Gold (999.9 equivalent)
 * PureGold = Weight * (Purity / 999.9) or (Purity / 1000)
 * standard: 585 proba = 0.585 pure gold ratio
 */
export function calculatePureGoldEquivalent(weight, purity) {
  const w = toDecimal(weight);
  const p = toDecimal(purity);
  if (w.isZero() || p.isZero()) return 0;
  // Standard metric: purity / 1000 (e.g. 585 / 1000 = 0.585)
  const pureRatio = p.dividedBy(1000);
  return w.times(pureRatio).toDecimalPlaces(3, Decimal.ROUND_HALF_UP).toNumber();
}

/**
 * Calculate Ligature requirement for alloying:
 * Transforming 999 gold to lower proba (e.g. 585):
 * Total weight needed = PureWeight / (TargetPurity / 1000)
 * Ligature (copper/silver) to add = Total weight - PureWeight
 */
export function calculateLigatureRequirement(pureWeight, targetPurity = 585) {
  const pure = toDecimal(pureWeight);
  const target = toDecimal(targetPurity);
  if (pure.isZero() || target.isZero()) {
    return { expectedTotal: 0, ligatureToAdd: 0 };
  }
  const ratio = target.dividedBy(1000);
  const expectedTotal = pure.dividedBy(ratio).toDecimalPlaces(3, Decimal.ROUND_HALF_UP);
  const ligatureToAdd = expectedTotal.minus(pure).toDecimalPlaces(3, Decimal.ROUND_HALF_UP);
  return {
    expectedTotal: expectedTotal.toNumber(),
    ligatureToAdd: ligatureToAdd.toNumber(),
  };
}

/**
 * High-Precision Ugar (Manufacturing Loss) Calculator
 * Ugar = GivenWeight - (ReceivedWeight + ReturnedScrap)
 */
export function calculateHighPrecisionUgar({
  givenWeight = 0,
  receivedWeight = 0,
  returnedScrap = 0,
  allowedLossRate = 2.0, // default 2%
  goldPricePerGram = 75, // USD per gram
}) {
  const given = toDecimal(givenWeight);
  const received = toDecimal(receivedWeight);
  const scrap = toDecimal(returnedScrap);
  const allowedRate = toDecimal(allowedLossRate);
  const price = toDecimal(goldPricePerGram);

  // Total metal returned = received + scrap
  const returnedTotalDec = received.plus(scrap);
  const returnedTotal = returnedTotalDec.toDecimalPlaces(3, Decimal.ROUND_HALF_UP).toNumber();

  // Actual Loss weight = given - (received + scrap)
  const lossWeightDec = given.minus(returnedTotalDec);
  const lossWeight = lossWeightDec.isNegative()
    ? 0
    : lossWeightDec.toDecimalPlaces(3, Decimal.ROUND_HALF_UP).toNumber();

  // Loss percentage = (lossWeight / given) * 100
  let lossPercentage = 0;
  if (given.greaterThan(0)) {
    lossPercentage = lossWeightDec
      .dividedBy(given)
      .times(100)
      .toDecimalPlaces(2, Decimal.ROUND_HALF_UP)
      .toNumber();
    if (lossPercentage < 0) lossPercentage = 0;
  }

  // Allowed loss weight = given * (allowedRate / 100)
  const allowedLossWeightDec = given.times(allowedRate.dividedBy(100));
  const allowedLossWeight = allowedLossWeightDec.toDecimalPlaces(3, Decimal.ROUND_HALF_UP).toNumber();

  // Excess loss weight = max(0, lossWeight - allowedLossWeight)
  const excessLossDec = lossWeightDec.minus(allowedLossWeightDec);
  const excessLossWeight = excessLossDec.isNegative()
    ? 0
    : excessLossDec.toDecimalPlaces(3, Decimal.ROUND_HALF_UP).toNumber();

  // Over-threshold trigger: loss percentage exceeds allowed rate by any margin
  const isOverThreshold = lossPercentage > allowedRate.toNumber();

  // Financial loss in USD = excessLossWeight * pricePerGram
  const financialLoss = toDecimal(excessLossWeight)
    .times(price)
    .toDecimalPlaces(2, Decimal.ROUND_HALF_UP)
    .toNumber();

  return {
    givenWeight: given.toDecimalPlaces(3, Decimal.ROUND_HALF_UP).toNumber(),
    receivedWeight: received.toDecimalPlaces(3, Decimal.ROUND_HALF_UP).toNumber(),
    returnedScrap: scrap.toDecimalPlaces(3, Decimal.ROUND_HALF_UP).toNumber(),
    returnedTotal,
    lossWeight,
    lossPercentage,
    allowedLossRate: allowedRate.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber(),
    allowedLossWeight,
    excessLossWeight,
    isOverThreshold,
    financialLoss,
    status: isOverThreshold ? 'alert' : 'acceptable',
  };
}

/**
 * ugarCalculator.js
 * Backward-compatible wrapper delegating to High-Precision Decimal calculations
 */

import { calculateHighPrecisionUgar } from './precisionMath';

export const calculateUgar = (params) => {
  return calculateHighPrecisionUgar(params);
};

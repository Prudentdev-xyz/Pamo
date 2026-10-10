export interface Growth {
  /** Projected balance at the end. */
  final: number;
  /** Starting amount plus every monthly top-up. */
  putIn: number;
  /** Estimated interest: final minus putIn. */
  interest: number;
  /** Balance at the end of each month. */
  points: number[];
}

/**
 * Projects savings at a fixed rate (Architecture §7.6). APY is already compounded,
 * so the monthly rate is its twelfth root, not APY / 12. An estimate, never a promise.
 */
export function growth(start: number, monthly: number, months: number, apy: number): Growth {
  const r = Math.pow(1 + apy, 1 / 12) - 1;
  let balance = start;
  const points: number[] = [];
  for (let month = 0; month < months; month++) {
    balance = (balance + monthly) * (1 + r);
    points.push(balance);
  }
  const putIn = start + monthly * months;
  return { final: balance, putIn, interest: balance - putIn, points };
}

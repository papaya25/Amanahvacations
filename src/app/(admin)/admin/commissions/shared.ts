/* Commission rules + row shapes shared by the server calculator and the
   client ledger. Plain module — safe to import from both sides. */

export const tourRatePct = (people: number) => (people >= 3 ? 10 : 5);
export const STAY_COMMISSION_PCT = 10;

export type OwedToRow = {
  month: string; // YYYY-MM
  date: string;
  orderId: string;
  title: string;
  people: number;
  amountMXN: number;
  ratePct: number;
  commissionMXN: number;
};

export type OwedByRow = {
  month: string;
  date: string;
  orderId: string;
  title: string;
  guest: string;
  amountUSD: number;
  commissionUSD: number;
  commissionMXN: number;
};

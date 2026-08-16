import { getMostRecentDividendPayoutForSymbol } from "@/actions/payouts";
import { Transaction } from "@/types";
import { useEffect, useState } from "react";

function calculateHoldingsAsOf(
  transactions: Transaction[],
  symbol: string,
  asOfDate: Date
): number {
  return transactions
    .filter((t) => t.stockSymbol === symbol && new Date(t.transactionDate) < asOfDate)
    .reduce((total, t) => {
      if (t.type === "buy") return total + (t.numberOfShares ?? 0);
      if (t.type === "sell") return total - (t.numberOfShares ?? 0);
      return total;
    }, 0);
}

export function useDividendSharesAutoFill(
  symbol: string | undefined,
  isDividend: boolean,
  transactions: Transaction[]
): number | null {
  const [autoFilledShares, setAutoFilledShares] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function calculate() {
      if (!isDividend || !symbol) {
        setAutoFilledShares(null);
        return;
      }

      const result = await getMostRecentDividendPayoutForSymbol(symbol);
      if (cancelled) return; // discard stale response

      const payoutData = result && 'success' in result && result.success
        ? (result.data as { symbol: string; exDate: string | Date; actionType: string } | null)
        : null;
      const exDate = payoutData?.exDate ? new Date(payoutData.exDate) : null;

      if (exDate) {
        const eligible = calculateHoldingsAsOf(transactions, symbol, exDate);
        if (!cancelled) setAutoFilledShares(eligible >= 0 ? eligible : null);
      } else {
        const current = calculateHoldingsAsOf(transactions, symbol, new Date());
        if (!cancelled) setAutoFilledShares(current > 0 ? current : null);
      }
    }

    calculate();

    return () => { cancelled = true; }; 

  }, [symbol, isDividend, transactions]);

  return autoFilledShares;
}

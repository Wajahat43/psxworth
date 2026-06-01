import { coerceToLocalDateDate } from "@/types/localDate";
import { BuyTransaction, DividendTransaction, SellTransaction, TransactionSchemaType } from "@/types";
import { STOCKS_INFO } from "@/utils/constants/stockSymbols";
import { formatCurrency, formatPercentage } from "@/utils/helpers/formatHelpers";
import React from "react";

const isValidStockSymbol = (symbol: string) => {
  if (!symbol) return false;
  return STOCKS_INFO.some((stock) => stock.symbol === symbol);
};

const displayStockSymbol = (symbol: string) => {
  if (!symbol) {
    return <span className="text-red-500">MISSING Stock Symbol</span>;
  }
  if (!isValidStockSymbol(symbol)) {
    return <span className="text-red-500">Invalid ({symbol})</span>;
  }
  return <>{symbol}</>;
};

const displayValue = (fieldName: string, value: any, formatter?: (value: any) => string) => {
  if (value === undefined || value === null || value === "") {
    return <span className="text-red-500">MISSING {fieldName}</span>;
  }
  return <>{formatter ? formatter(value) : String(value)}</>;
};

const displaySharesValue = (value: unknown) => {
  if (value === undefined || value === null || value === "") {
    return <span className="text-red-500">MISSING Number of Shares</span>;
  }

  const sharesValue = Number(value);
  if (!Number.isFinite(sharesValue) || sharesValue <= 0) {
    return <span className="text-red-500">{String(value)}</span>;
  }

  return <>{String(value)}</>;
};

interface TransactionSummaryProps {
  transaction: TransactionSchemaType;
}

export const TransactionSummary: React.FC<TransactionSummaryProps> = ({ transaction }) => {
  const { type, stockSymbol, numberOfShares, transactionDate, isCommissionPercentage } = transaction;
  const date = transactionDate ? (
    <> on {coerceToLocalDateDate(transactionDate).toLocaleDateString()}</>
  ) : (
    <span className="text-red-500">MISSING Transaction Date</span>
  );

  let totalCommission = 0;
  const commissionAndTaxes = transaction.commissionAndTaxes ?? 0;

  if (isCommissionPercentage) {
    if (type === "buy" || type === "sell") {
      const { pricePerShare } = transaction as BuyTransaction | SellTransaction;
      totalCommission = (pricePerShare * numberOfShares * commissionAndTaxes) / 100;
    } else if (type === "dividend") {
      const { dividendPerShare } = transaction as DividendTransaction;
      totalCommission = (dividendPerShare * numberOfShares * commissionAndTaxes) / 100;
    }
  } else {
    totalCommission = commissionAndTaxes;
  }

  if (type === "buy") {
    const { pricePerShare } = transaction as BuyTransaction;
    const totalValue = pricePerShare * numberOfShares + totalCommission;
    return (
      <p className="text-sm text-muted-foreground mt-2">
        Buy {displaySharesValue(numberOfShares)} shares of {displayStockSymbol(stockSymbol)} at{" "}
        {displayValue("Price per Share", pricePerShare, formatCurrency)} with{" "}
        {isCommissionPercentage && commissionAndTaxes
          ? formatPercentage(commissionAndTaxes)
          : formatCurrency(totalCommission)}{" "}
        commission for a total of {formatCurrency(totalValue)} {date}
      </p>
    );
  } else if (type === "sell") {
    const { pricePerShare } = transaction as SellTransaction;
    const totalValue = pricePerShare * numberOfShares - totalCommission;
    return (
      <p className="text-sm text-muted-foreground mt-2">
        Sell {displaySharesValue(numberOfShares)} shares of {displayStockSymbol(stockSymbol)}
        {pricePerShare ? <> at {displayValue("Price per Share", pricePerShare, formatCurrency)}</> : ""} with{" "}
        {isCommissionPercentage && commissionAndTaxes
          ? formatPercentage(commissionAndTaxes)
          : formatCurrency(totalCommission)}{" "}
        commission for a total of {formatCurrency(totalValue)} {date}
      </p>
    );
  } else if (type === "dividend") {
    const { dividendPerShare } = transaction as DividendTransaction;
    const netDividend = dividendPerShare * numberOfShares - totalCommission;
    return (
      <p className="text-sm text-muted-foreground mt-2">
        Received {displayValue("Dividend per Share", dividendPerShare, formatCurrency)} dividend per share for{" "}
        {displayStockSymbol(stockSymbol)}
        {numberOfShares !== undefined && numberOfShares !== null && String(numberOfShares).trim() !== "" ? (
          <> ({displaySharesValue(numberOfShares)} shares)</>
        ) : (
          ""
        )} with{" "}
        {isCommissionPercentage && commissionAndTaxes
          ? formatPercentage(commissionAndTaxes)
          : formatCurrency(totalCommission)}{" "}
        commission, for a net dividend of {formatCurrency(netDividend)} {date}
      </p>
    );
  }

  return (
    <p className="text-sm text-muted-foreground">
      {displayValue("Transaction Type", type)} transaction for {displayStockSymbol(stockSymbol)}
    </p>
  );
};

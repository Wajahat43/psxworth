"use client";

import { TableHeaderCell } from "@/components/ui/table";
import { Transaction } from "@/types";
import { formatCurrency, formatDate } from "@/utils/helpers/formatHelpers";
import { calculateTotalValue, calculateCommissionAndTaxes } from "@/utils/helpers/transactionsHelpers";
import { ColumnDef } from "@tanstack/react-table";
import { ChevronRight } from "lucide-react";
import { twMerge } from "tailwind-merge";
import TransactionTableActions, { TransactionActions } from "./TransactionActions";

export const getChangeSinceTransactionPct = (
  transaction: Transaction,
  pricesBySymbol: Record<string, number>
): number | null => {
  if (transaction.type !== "buy" && transaction.type !== "sell") {
    return null;
  }

  const transactionPrice = transaction.pricePerShare;
  if (transactionPrice <= 0) {
    return null;
  }

  const currentPrice = pricesBySymbol[transaction.stockSymbol];
  if (currentPrice === undefined) {
    return null;
  }

  return ((currentPrice - transactionPrice) / transactionPrice) * 100;
};

export const getProfitLossColorClass = (value: number): string => {
  if (value > 0) {
    return "text-green-500";
  }

  if (value < 0) {
    return "text-red-500";
  }

  return "";
};

export const formatSignedPercentage = (value: number): string => {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
};

export const getTransactionsTableDesktopColumns = (
  pricesBySymbol: Record<string, number>
): ColumnDef<Transaction>[] => [
  {
    accessorKey: "transactionDate",
    header: ({ column }) => <TableHeaderCell column={column} heading="Date" />,
    cell: ({ row }) => {
      return (
        <div className="flex gap-1 items-center">
          <div>
            <ChevronRight
              className={twMerge(
                "h-4 w-4 text-gray-100 transition-transform duration-500",
                row.getIsExpanded() ? "rotate-90" : "rotate-0"
              )}
              strokeWidth={4}
            />
          </div>
          <div className="font-medium">{formatDate(row.getValue("transactionDate"))}</div>
        </div>
      );
    },
    sortingFn: "datetime",
  },
  {
    accessorKey: "type",
    header: ({ column }) => <TableHeaderCell column={column} heading="Type" />,
    cell: ({ row }) => {
      const type = row.getValue("type") as string;
      return (
        <div
          className={twMerge(
            "capitalize font-medium",
            type === "buy" ? "text-green-500" : "",
            type === "sell" ? "text-red-500" : "",
            type === "dividend" ? "text-blue-500" : ""
          )}
        >
          {type}
        </div>
      );
    },
  },
  {
    accessorKey: "stockSymbol",
    enableHiding: false,
    header: ({ column }) => <TableHeaderCell column={column} heading="Stock" />,
    cell: ({ row }) => {
      return <div className="font-medium">{row.getValue("stockSymbol")}</div>;
    },
  },
  {
    accessorKey: "numberOfShares",
    header: ({ column }) => <TableHeaderCell column={column} heading="Shares" />,
    cell: ({ row }) => {
      return <div className="font-medium">{(row.getValue("numberOfShares") as number).toLocaleString()}</div>;
    },
  },
  {
    accessorKey: "pricePerShare",
    header: ({ column }) => <TableHeaderCell column={column} heading="Price" />,
    cell: ({ row }) => {
      const transaction = row.original;
      if (transaction.type === "buy" || transaction.type === "sell") {
        return <div>{formatCurrency(transaction.pricePerShare)}</div>;
      } else if (transaction.type === "dividend") {
        return <div>{formatCurrency(transaction.dividendPerShare)}</div>;
      }
      return null;
    },
  },
  {
    id: "priceChangeSinceTransaction",
    accessorFn: (row) => getChangeSinceTransactionPct(row, pricesBySymbol),
    header: ({ column }) => <TableHeaderCell column={column} heading="Change Since Tx" />,
    sortingFn: (rowA, rowB, columnId) => {
      const valueA = (rowA.getValue(columnId) as number | null) ?? Number.NEGATIVE_INFINITY;
      const valueB = (rowB.getValue(columnId) as number | null) ?? Number.NEGATIVE_INFINITY;
      return valueA - valueB;
    },
    cell: ({ row }) => {
      const changePct = getChangeSinceTransactionPct(row.original, pricesBySymbol);

      if (changePct === null) {
        return <div>—</div>;
      }

      return <div className={getProfitLossColorClass(changePct)}>{formatSignedPercentage(changePct)}</div>;
    },
     enableSorting: false,
  },
  {
    accessorKey: "totalValue",
    header: ({ column }) => <TableHeaderCell column={column} heading="Total Value" />,
    accessorFn: (row) => calculateTotalValue(row),
    cell: ({ row }) => {
      const totalValue = calculateTotalValue(row.original);
      return <div>{formatCurrency(totalValue)}</div>;
    },
    enableSorting: false, 
  },
  {
    accessorKey: "commissionAndTaxes",
    header: ({ column }) => <TableHeaderCell column={column} heading="Commission/Taxes" />,
    accessorFn: (row) => calculateCommissionAndTaxes(row),
    cell: ({ row }) => {
      const value = calculateCommissionAndTaxes(row.original);
      return value ? <div>{formatCurrency(value)}</div> : <div>-</div>;
    },
    enableSorting: false, 
  },
  {
    id: "actions",
    header: ({ column }) => <TableHeaderCell column={column} heading="Actions" />,
    cell: ({ row }) => {
      const transaction = row.original;
      return <TransactionTableActions transaction={transaction} />;
    },
    enableSorting: false,
  },
];

export const getTransactionsTableMobileColumns = (): ColumnDef<Transaction>[] => [
  {
    accessorKey: "transactionDate",
    enableHiding: false,
    header: ({ column }) => <TableHeaderCell column={column} heading="Transaction" />,
    cell: ({ row }) => {
      return (
        <div className="flex gap-1 items-center">
          <div>
            <ChevronRight
              className={twMerge(
                "h-4 w-4 text-gray-100 transition-transform duration-500",
                row.getIsExpanded() ? "rotate-90" : "rotate-0"
              )}
              strokeWidth={4}
            />
          </div>
          <div className="flex flex-col gap-1">
            <div className="font-bold flex gap-2 items-center">
              <span>{row.original.stockSymbol} - </span>
              <span
                className={twMerge(
                  "capitalize",
                  row.original.type === "buy" ? "text-green-500" : "",
                  row.original.type === "sell" ? "text-red-500" : "",
                  row.original.type === "dividend" ? "text-blue-500" : ""
                )}
              >
                {row.original.type}
              </span>
            </div>
            <div className="text-xs text-gray-400">{formatDate(row.getValue("transactionDate"))}</div>
          </div>
        </div>
      );
    },
    sortingFn: "datetime",
  },
  {
    accessorKey: "totalValue",
    header: ({ column }) => <TableHeaderCell column={column} heading="Details" />,
    accessorFn: (row) => calculateTotalValue(row),
    cell: ({ row }) => {
      const transaction = row.original;
      const totalValue = calculateTotalValue(transaction);

      let priceValue = 0;
      if (transaction.type === "buy" || transaction.type === "sell") {
        priceValue = transaction.pricePerShare || 0;
      } else if (transaction.type === "dividend") {
        priceValue = transaction.dividendPerShare || 0;
      }

      return (
        <div className="flex justify-between">
          <div className="flex flex-col gap-1">
            <div className="font-semibold">Total: {formatCurrency(totalValue)}</div>
            <div className="flex gap-0 items-center text-gray-400">
              <span>{transaction.numberOfShares.toLocaleString()}</span>
              <span>@</span>
              <span>{formatCurrency(priceValue)}</span>
            </div>
          </div>
          <div className="flex justify-center w-fit">
            <TransactionActions transaction={transaction} />
          </div>
        </div>
      );
    },
  },
];

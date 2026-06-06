"use client";

import { stockPriceQueries } from "@/features/stockPrices/queries";
import { Transaction } from "@/types";
import useBreakpoint from "@/utils/hooks/useBreakpoints";
import { useTransactions } from "@/utils/hooks/useTransactionData";
import { useQuery } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import React, { useState } from "react";
import { DataTable } from "./components/DataTable";
import {
  getChangeSinceTransactionPct,
  getProfitLossColorClass,
  formatSignedPercentage,
  getTransactionsTableDesktopColumns,
  getTransactionsTableMobileColumns,
} from "./components/columns";

interface TransactionsTableProps {
  portfolioId: number;
}

interface TransactionFilters {
  types?: string[];
  symbols?: string[];
}

export const TransactionsTable = (props: TransactionsTableProps) => {
  const { portfolioId } = props;

  const windowType = useBreakpoint();
  const shouldShowMobileLayout = windowType.isSmall || windowType.isMedium;

  const [shouldShowFullTable, setShouldShowFullTable] = React.useState(!shouldShowMobileLayout);

  const [pageState, setPageState] = useState({
    page: 1,
    pageSize: 10,
  });

  const [filters, setFilters] = React.useState<TransactionFilters>({});
  const [sorting, setSorting] = React.useState<{ key: string, order: "asc" | "desc" } | null>(null);

  const { transactions } = useTransactions(portfolioId, pageState.page, pageState.pageSize, filters, sorting);
  const totalPages = transactions?.data?.totalPages ?? 0;
  const totalCount=transactions?.data?.totalCount ?? 0
  const pricesQuery = useQuery({
    ...stockPriceQueries.latestAll(),
    select: (data) => {
      const pricesBySymbol: Record<string, number> = {};
      for (const symbol in data) {
        pricesBySymbol[symbol] = data[symbol].price;
      }
      return pricesBySymbol;
    },
  });

  const handleToggle = (fullTable: boolean) => {
    setShouldShowFullTable(fullTable);
  };

  const pricesBySymbol = pricesQuery.data ?? {};
  const allTransactions = transactions.data?.items || [];
  const columns = shouldShowFullTable
    ? getTransactionsTableDesktopColumns(pricesBySymbol)
    : getTransactionsTableMobileColumns();
  const errorMessage = transactions.error instanceof Error ? transactions.error.message : "Unable to load transactions";

  const renderMobileSubRow = (transaction: Transaction) => {
    const changePct = getChangeSinceTransactionPct(transaction, pricesBySymbol);
    return (
      <span className={changePct === null ? undefined : getProfitLossColorClass(changePct)}>
        Since transaction: {changePct === null ? "—" : formatSignedPercentage(changePct)}
      </span>
    );
  };

  if (transactions.isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-52">
        <h2 className="text-lg font-bold">Error</h2>
        <p>{errorMessage}</p>
      </div>
    );
  }

  if (!windowType) {
    return null;
  }

  return (
    <>
      <DataTable
        columns={columns}
        data={allTransactions}
        isLoading={transactions.isLoading}
        shouldShowMobileLayout={!shouldShowFullTable}
        onToggleView={handleToggle}
        renderMobileSubRow={!shouldShowFullTable ? renderMobileSubRow : undefined}
        pageState={pageState}
        setPageState={setPageState}
        totalPages={totalPages}
        filters={filters}
        setFilters={setFilters}
        sorting={sorting}
        totalCount={totalCount}
        setSorting={setSorting}
        availableSymbols={transactions.data?.availableSymbols ?? []}

      />
    </>
  );
};

// Because we are using useBreakpoint that depends on window,
// we need to disable SSR for this component so that we get proper
// breakpoints on the client side.
const TransactionsTableWithoutSSR = dynamic(() => Promise.resolve(TransactionsTable), { ssr: false });

export default TransactionsTableWithoutSSR;

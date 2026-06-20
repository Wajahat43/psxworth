"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Transaction } from "@/types";
import {
  exportTransactionsToCSV,
  downloadCSV,
  generateExportFilename,
} from "@/utils/helpers/exportTransactionsHelpers";
import { Download, FileDown } from "lucide-react";
import React from "react";
import { useParams } from "next/navigation";
import { useTransactions } from "@/utils/hooks/useTransactionData";

interface ExportTransactionsButtonProps {
  transactions: Transaction[];
  currentViewTransactions?: Transaction[];
  currentViewFilters?: {
    types?: string[];
    symbols?: string[];
  };
  disabled?: boolean;
  className?: string;
  totalCount: number,
}

export function ExportTransactionsButton({
  transactions,
  currentViewTransactions,
  currentViewFilters,
  totalCount,
  disabled = false,
  className,
}: ExportTransactionsButtonProps) {
  const params = useParams();
  const portfolioId = Number(params.portfolioId)

  const { AllTransactions } = useTransactions(portfolioId,1,10,currentViewFilters)
 const handleExportAll = async () => {
    
    const result = await AllTransactions.refetch();
    const data = result.data?.items;
    if(!data) return 
    const csvContent = exportTransactionsToCSV(data);
    const filename = generateExportFilename(false, data.length);
    downloadCSV(csvContent, filename);
 
};



  const handleExportCurrentView = () => {
    if (!currentViewTransactions) return;

    const csvContent = exportTransactionsToCSV(currentViewTransactions);
    const filename = generateExportFilename(true, currentViewTransactions.length);
    downloadCSV(csvContent, filename);
  };

  const hasCurrentView = currentViewTransactions !== undefined && !disabled;
  const hasFilters =
    currentViewFilters &&
    ((currentViewFilters.types && currentViewFilters.types.length > 0) ||
      (currentViewFilters.symbols && currentViewFilters.symbols.length > 0));

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled || transactions.length === 0}
          className={cn("h-8", className)}
        >
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuItem onClick={handleExportAll}>
          <FileDown className="h-4 w-4 mr-2" />
          Export All Transactions
          <span className="ml-auto text-xs text-gray-300">({totalCount} records)</span>
        </DropdownMenuItem>

        {hasCurrentView && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleExportCurrentView}
              disabled={!currentViewTransactions || currentViewTransactions.length === 0}
            >
              <FileDown className="h-4 w-4 mr-2" />
              Export Current View
              <span className="ml-auto text-xs text-gray-300">({currentViewTransactions?.length || 0} records)</span>
            </DropdownMenuItem>
            {hasFilters && <div className="px-2 py-1 text-xs text-muted-foreground">Includes filtered results</div>}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

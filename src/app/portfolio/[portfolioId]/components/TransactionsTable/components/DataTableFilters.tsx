"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuLabel,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { Transaction } from "@/types";
import { FilterIcon } from "lucide-react";
import { useState, useEffect } from "react";

interface DataTableFiltersProps {
  data: Transaction[];
  onFilterChange: (filters: { types?: string[]; symbols?: string[] }) => void;
  activeFilters: {
    types?: string[];
    symbols?: string[];
  };
  availableSymbols: string[]
}

export function DataTableFilters({ data, onFilterChange, activeFilters, availableSymbols }: DataTableFiltersProps) {
  // State for dropdown open/close
  const [isOpen, setIsOpen] = useState(false);

  // State for pending filters (not yet applied)
  const [pendingFilters, setPendingFilters] = useState<{
    types?: string[];
    symbols?: string[];
  }>({});

  // Initialize pending filters when active filters change
  useEffect(() => {
    setPendingFilters(activeFilters);
  }, [activeFilters]);

  // Extract unique transaction types from data
  const transactionTypes = (() => {
    const types = new Set<string>();
    data.forEach((transaction) => {
      types.add(transaction.type);
    });
    return Array.from(types);
  })();

  // Extract unique stock symbols from data
  const stockSymbol = (() => {
    const symbols = new Set<string>();
    data.forEach((transaction) => {
      symbols.add(transaction.stockSymbol);
    });
    return Array.from(symbols).sort();
  })();

  const stockSymbols = availableSymbols ?? stockSymbol
  const toggleTypeFilter = (type: string) => {
    const currentTypes = pendingFilters.types || [];
    const newTypes = currentTypes.includes(type) ? currentTypes.filter((t) => t !== type) : [...currentTypes, type];

    setPendingFilters({
      ...pendingFilters,
      types: newTypes.length > 0 ? newTypes : undefined,
    });
  };

  const toggleSymbolFilter = (symbol: string) => {
    const currentSymbols = pendingFilters.symbols || [];
    const newSymbols = currentSymbols.includes(symbol)
      ? currentSymbols.filter((s) => s !== symbol)
      : [...currentSymbols, symbol];

    setPendingFilters({
      ...pendingFilters,
      symbols: newSymbols.length > 0 ? newSymbols : undefined,
    });
  };

  const applyFilters = () => {
    onFilterChange(pendingFilters);
    setIsOpen(false);
  };

  const clearFilters = () => {
    setPendingFilters({});
    onFilterChange({});
    setIsOpen(false);
  };

  const hasActiveFilters =
    (activeFilters.types && activeFilters.types.length > 0) ||
    (activeFilters.symbols && activeFilters.symbols.length > 0);
  const activeFiltersCount = (activeFilters.types?.length || 0) + (activeFilters.symbols?.length || 0);

  const hasPendingChanges = JSON.stringify(pendingFilters) !== JSON.stringify(activeFilters);

  return (
    <div className="flex items-center space-x-2">
      <DropdownMenu modal={false} open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant={hasActiveFilters ? "default" : "outline"}
            size="sm"
            className="h-8 bg-slate-700 border-slate-600 hover:bg-slate-600 text-slate-100"
          >
            <FilterIcon className="h-4 w-4 mr-2" />
            Filter
            {hasActiveFilters && (
              <span className="ml-1 rounded-full bg-primary-foreground text-gray-100/90 w-5 h-5 text-xs flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[200px]">
          <DropdownMenuLabel>Transaction Type</DropdownMenuLabel>
          {transactionTypes.map((type) => (
            <DropdownMenuCheckboxItem
              key={`type-${type}`}
              checked={pendingFilters.types?.includes(type)}
              onCheckedChange={() => toggleTypeFilter(type)}
              onSelect={(e) => e.preventDefault()}
              className="capitalize"
            >
              {type}
            </DropdownMenuCheckboxItem>
          ))}

          <DropdownMenuSeparator />

          <DropdownMenuLabel>Stock Symbol</DropdownMenuLabel>
          <div className="max-h-[200px] overflow-y-auto">
            {stockSymbols?.map((symbol) => (
              <DropdownMenuCheckboxItem
                key={`symbol-${symbol}`}
                checked={pendingFilters.symbols?.includes(symbol)}
                onCheckedChange={() => toggleSymbolFilter(symbol)}
                onSelect={(e) => e.preventDefault()}
              >
                {symbol}
              </DropdownMenuCheckboxItem>
            ))}
          </div>

          <DropdownMenuSeparator />

          <div className="flex gap-2 p-2">
            <Button variant="default" size="sm" className="flex-1" onClick={applyFilters} disabled={!hasPendingChanges}>
              Apply Filters
            </Button>
            {(hasActiveFilters || hasPendingChanges) && (
              <Button variant="ghost" size="sm" className="flex-1" onClick={clearFilters}>
                Clear
              </Button>
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

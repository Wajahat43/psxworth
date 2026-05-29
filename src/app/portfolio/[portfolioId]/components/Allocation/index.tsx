"use client";

import { STOCKS_INFO } from "@/utils/constants/stockSymbols";
import { AlertTriangle } from "lucide-react";
import { useState } from "react";
import { AllocationChart } from "./components/AllocationChart";
import { AllocationHeader } from "./components/AllocationHeader";
import { AllocationList } from "./components/AllocationList";
import { useAllocationData } from "./hooks/useAllocationData";
import { AllocationFilters, AllocationProps } from "./utils/types";

export const AllocationPage = ({ stocks }: AllocationProps) => {
  const [filters, setFilters] = useState<AllocationFilters>({
    view: "value",
    viewMode: "stocks",
    etfExpanded: false,
  });

  const { data, totalAmount, isPending, error } = useAllocationData({
    stocks,
    stocksInfo: STOCKS_INFO,
    filters,
  });
  const manyItems = data.length > 15;

  return (
    <div className="relative rounded-lg border border-slate-700 shadow-md">
      {/* Header */}
      <div className="bg-slate-800 text-gray-100 border-b border-slate-700 p-2 sticky -top-3 z-20">
        <AllocationHeader filters={filters} setFilters={setFilters} totalAmount={totalAmount} />
      </div>

      {/* Body */}
      <div className="bg-slate-900 text-gray-100 p-2 relative">
        {filters.etfExpanded && isPending && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/70 z-10">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-500 border-t-white" />
          </div>
        )}
        {error && (
          <div className="mb-4 flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <p className="flex-1">
              Could not load ETF allocation details. Existing allocations are still shown; you can retry or collapse
              ETFs.
            </p>
          </div>
        )}
        {data.length > 0 ? (
          manyItems ? (
            <div className="flex flex-col gap-8">
              <div className="relative">
                <AllocationChart data={data} viewMode={filters.viewMode} compact />
              </div>
              <div>
                <AllocationList data={data} viewMode={filters.viewMode} />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="relative order-1 sm:order-2">
                <AllocationChart data={data} viewMode={filters.viewMode} />
              </div>
              <div className="order-2 sm:order-1">
                <AllocationList data={data} viewMode={filters.viewMode} />
              </div>
            </div>
          )
        ) : (
          <div className="grid grid-cols-1">
            <div className=" flex min-h-64 justify-center items-center">
              <p className="text-gray-400 text-lg text-center">
                No data available. Please add transactions to see allocation.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllocationPage;

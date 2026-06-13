"use client";

import { ErrorState } from "@/components/molecules/ErrorState";
import type { ApexOptions } from "apexcharts";
import { Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import { useLayoutEffect, useRef, useState } from "react";
import { useEarliestTransactionDate, usePortfolioStocks, useHistoricalReturns } from "../hooks/useHistoricalReturns";
import { ReturnType, Scope, DateRange } from "../shared/types";
import { DesktopFilters } from "./DesktopFilters";
import { MobileFilters } from "./MobileFilters";
import { getHistoricalReturnsChartOptions } from "./chartConfig";
import { prepareChartData, getDefaultDateRange } from "./utils";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface HistoricalReturnsChartProps {
  portfolioId: number;
}

export function HistoricalReturnsChart({ portfolioId }: HistoricalReturnsChartProps) {
  const [returnType, setReturnType] = useState<ReturnType>("simple");
  const [scope, setScope] = useState<Scope>("portfolio");
  const [selectedStock, setSelectedStock] = useState<string>("");
  const [dateRange, setDateRange] = useState<DateRange>(() => getDefaultDateRange());
  const [isDateRangeManuallySet, setIsDateRangeManuallySet] = useState(false);

  const chartContainerRef = useRef<HTMLDivElement>(null);

  const { data: availableStocks = [] } = usePortfolioStocks(portfolioId);

  const effectiveSelectedStock =
    selectedStock && availableStocks.includes(selectedStock) ? selectedStock : availableStocks[0];
  const { data: earliestTransactionDate } = useEarliestTransactionDate(
    portfolioId,
    scope,
    scope === "stock" ? effectiveSelectedStock : undefined
  );

  const effectiveDateRange = isDateRangeManuallySet ? dateRange : getDefaultDateRange(earliestTransactionDate);

  const handleDateRangeChange = (nextDateRange: DateRange) => {
    setIsDateRangeManuallySet(true);
    setDateRange(nextDateRange);
  };

  const {
    data: returnsData,
    isPending,
    isFetching,
    isPlaceholderData,
    error,
  } = useHistoricalReturns({
    portfolioId,
    startDate: effectiveDateRange.startDate,
    endDate: effectiveDateRange.endDate,
    returnType,
    scope,
    stockSymbol: scope === "stock" ? effectiveSelectedStock : undefined,
  });

  const data = returnsData?.data || [];
  const chartData = prepareChartData(data);

  const chartOptions: ApexOptions = getHistoricalReturnsChartOptions({
    returnType,
    scope,
    error: error as Error | null,
    chartData,
  });

  const getReturnTypeName = (type: ReturnType): string => {
    switch (type) {
      case "twr":
        return "Time-Weighted Return";
      case "mwr":
        return "Money-Weighted Return";
      case "simple":
        return "Simple Return";
      default:
        return "Return";
    }
  };

  const series = [
    {
      name: getReturnTypeName(returnType),
      data: chartData.map((point) => [point.x, point.y]),
    },
  ];

  const hasData = data.length > 0;

  // Prevent wheel zoom on the chart while allowing page scroll
  useLayoutEffect(() => {
    const container = chartContainerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      // Check if the wheel event is on the ApexCharts canvas
      const target = e.target as HTMLElement;
      if (target.closest(".apexcharts-canvas")) {
        // Prevent ApexCharts from handling the wheel event for zoom
        e.stopPropagation();
      }
    };

    // Use capture phase to intercept before ApexCharts
    container.addEventListener("wheel", handleWheel, { capture: true, passive: true });
    return () => {
      container.removeEventListener("wheel", handleWheel, { capture: true });
    };
  }, []);

  return (
    <div className="rounded-lg bg-slate-800 shadow-md border border-slate-700">
      <div className="sticky -top-3 z-20 flex items-center justify-between gap-2 border-b border-slate-700 bg-slate-800 p-2">
        <h2 className="text-sm sm:text-lg font-semibold text-gray-100">Historical Returns</h2>

        <div className="md:hidden">
          <MobileFilters
            returnType={returnType}
            onReturnTypeChange={setReturnType}
            scope={scope}
            onScopeChange={setScope}
            onSelectedStockChange={setSelectedStock}
            effectiveSelectedStock={effectiveSelectedStock}
            availableStocks={availableStocks}
            dateRange={effectiveDateRange}
            onDateRangeChange={handleDateRangeChange}
          />
        </div>
        <div className="hidden md:block">
          <DesktopFilters
            returnType={returnType}
            onReturnTypeChange={setReturnType}
            scope={scope}
            onScopeChange={setScope}
            onSelectedStockChange={setSelectedStock}
            effectiveSelectedStock={effectiveSelectedStock}
            availableStocks={availableStocks}
            dateRange={effectiveDateRange}
            onDateRangeChange={handleDateRangeChange}
          />
        </div>
      </div>

      <div ref={chartContainerRef} className="w-full relative bg-slate-900" style={{ minHeight: "400px" }}>
        {isPending && !hasData ? (
          <div className="flex h-[400px] items-center justify-center bg-slate-900">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="text-gray-400">Loading historical returns...</span>
            </div>
          </div>
        ) : error ? (
          <ErrorState
            title="Failed to load historical returns"
            description="Failed to load historical returns data. Please try again later."
            className="h-[400px] rounded-none border-0 bg-slate-900 shadow-none"
          />
        ) : !hasData ? (
          <div className="flex h-[400px] items-center justify-center bg-slate-900 text-gray-400">
            No data available for the selected period
          </div>
        ) : (
          <div className="relative">
            <Chart
              options={chartOptions}
              series={series}
              type="line"
              height={400}
              style={{ opacity: isPlaceholderData ? 0.6 : 1 }}
            />
            {/* Loading overlay - shows when fetching new data */}
            {isFetching && (
              <div className="absolute inset-0 bg-slate-800/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span className="text-sm text-gray-300">Updating...</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { SidebarTrigger } from "@/components/animate-ui/components/radix/sidebar";
import { AllocationPerformance, UpcomingPayouts } from "@/components/organisms";
import { ImportTransactions } from "@/components/organisms/ImportTransactions/ImportTransactions";
import HideOnScroll from "@/components/ui/HideOnScroll";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StockDetailedPerformance } from "@/interfaces";
import { HoldingsFilterMode, useHoldingsFilter } from "@/store";
import { useScrollDirection } from "@/utils/hooks/useScrollDirection";
import { Plus } from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import { HistoricalReturnsChart } from "../../../../../features/historicalReturns/components/HistoricalReturnsChart";
import AddTransaction from "../AddTransaction";
import Allocation from "../Allocation";
import PerformanceBarChart from "../PerformanceBarChart";
import PortfolioPerformanceCard from "../PortfolioPerformanceCard";
import PortfolioPerformanceTableWithoutSSR from "../PortfolioPerformanceTable";
import TransactionsTableWithoutSSR from "../TransactionsTable";

interface PortfolioPageTabsProps {
  portfolioPerformance: StockDetailedPerformance[];
  portfolioId: number;
}

const matchesHoldingsFilter = (stock: StockDetailedPerformance, mode: HoldingsFilterMode) => {
  if (mode === "current") return stock.totalShares > 0;
  if (mode === "liquidated") return stock.totalShares <= 0;
  return true;
};

export function PortfolioPageTabs(props: PortfolioPageTabsProps) {
  const { portfolioPerformance, portfolioId } = props;
  const [activeTab, setActiveTab] = useState("performance");
  const performanceRef = useRef<HTMLDivElement | null>(null);
  const allocationRef = useRef<HTMLDivElement | null>(null);
  const payoutsRef = useRef<HTMLDivElement | null>(null);
  const transactionsRef = useRef<HTMLDivElement | null>(null);

  const holdingsFilter = useHoldingsFilter(portfolioId);
  const filteredPerformance =
    portfolioPerformance?.filter((stock) => matchesHoldingsFilter(stock, holdingsFilter)) || [];

  const symbols = filteredPerformance.map((s) => s.stockSymbol);
  const symbolToShares = Object.fromEntries(filteredPerformance.map((s) => [s.stockSymbol, s.totalShares]));

  const activeScrollRef =
    activeTab === "performance"
      ? performanceRef
      : activeTab === "allocation"
        ? allocationRef
        : activeTab === "payouts"
          ? payoutsRef
          : transactionsRef;

  const { isVisible: isFabVisible } = useScrollDirection(activeScrollRef, { threshold: 10 });
  return (
    <Tabs value={activeTab} className="flex h-full min-h-0 w-full flex-col" onValueChange={setActiveTab}>
      <div className="flex min-h-0 flex-1 flex-col rounded-none border border-sidebar-border/70 bg-sidebar/85 p-0 shadow-[0_10px_40px_rgba(0,0,0,0.25)] backdrop-blur-md">
        <div className="flex shrink-0 flex-col items-stretch gap-2 border-b border-sidebar-border/80 bg-background/10 px-2 pt-2 md:flex-row md:items-center md:justify-between md:px-3">
          <div className="flex w-full items-center gap-2 md:w-auto">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="size-8 border border-primary/50 bg-sidebar-accent/60 text-sidebar-foreground shadow-sm hover:bg-sidebar-accent" />
              <div className="h-6 w-px bg-sidebar-border/80" />
            </div>
            <TabsList className="no-scrollbar h-auto w-full justify-start overflow-x-auto rounded-none border-none bg-transparent p-0 md:w-auto">
              <TabsTrigger
                value="performance"
                className="text-sidebar-foreground/80 data-[state=active]:text-sidebar-foreground bg-transparent border-b-sidebar-border h-full rounded-none rounded-t border border-transparent px-2 py-2 text-xs whitespace-nowrap data-[state=active]:-mb-0.5 data-[state=active]:border-primary/70 data-[state=active]:border-b-sidebar data-[state=active]:bg-sidebar-accent/60 data-[state=active]:shadow-none md:px-3 md:text-base"
              >
                Performance
              </TabsTrigger>
              <TabsTrigger
                value="allocation"
                className="text-sidebar-foreground/80 data-[state=active]:text-sidebar-foreground bg-transparent border-b-sidebar-border h-full rounded-none rounded-t border border-transparent px-2 py-2 text-xs whitespace-nowrap data-[state=active]:-mb-0.5 data-[state=active]:border-primary/70 data-[state=active]:border-b-sidebar data-[state=active]:bg-sidebar-accent/60 data-[state=active]:shadow-none md:px-3 md:text-base"
              >
                Allocation
              </TabsTrigger>
              <TabsTrigger
                value="payouts"
                className="text-sidebar-foreground/80 data-[state=active]:text-sidebar-foreground bg-transparent border-b-sidebar-border h-full rounded-none rounded-t border border-transparent px-2 py-2 text-xs whitespace-nowrap data-[state=active]:-mb-0.5 data-[state=active]:border-primary/70 data-[state=active]:border-b-sidebar data-[state=active]:bg-sidebar-accent/60 data-[state=active]:shadow-none md:px-3 md:text-base"
              >
                Payouts
              </TabsTrigger>
              <TabsTrigger
                value="transactions"
                className="text-sidebar-foreground/80 data-[state=active]:text-sidebar-foreground bg-transparent border-b-sidebar-border h-full rounded-none rounded-t border border-transparent px-2 py-2 text-xs whitespace-nowrap data-[state=active]:-mb-0.5 data-[state=active]:border-primary/70 data-[state=active]:border-b-sidebar data-[state=active]:bg-sidebar-accent/60 data-[state=active]:shadow-none md:px-3 md:text-base"
              >
                Transactions
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="hidden md:flex md:w-auto md:items-center md:gap-2 pb-1">
            <AddTransaction
              portfolioId={portfolioId}
              wrapperClassName="w-full md:w-auto"
              buttonClassName="!mb-0 !me-0 w-full md:w-auto justify-center text-sm font-medium min-h-10 transition-all duration-200 md:hover:-translate-y-0.5"
            />
            <ImportTransactions
              wrapperClassName="w-full md:w-auto"
              buttonClassName="!mb-0 !me-0 w-full md:w-auto justify-center text-sm font-medium min-h-10 transition-all duration-200 md:hover:-translate-y-0.5"
            />
          </div>
        </div>

        <div className="mt-0 min-h-0 flex-1">
          <TabsContent
            value="performance"
            className="no-scrollbar mt-0 h-full overflow-y-auto px-2 py-2 md:px-3 md:py-3"
            ref={performanceRef}
          >
            <motion.div
              className="flex flex-col gap-2 pb-2"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <PortfolioPerformanceCard portfolioId={portfolioId} stocksPerformanceData={filteredPerformance} />
              <PerformanceBarChart data={filteredPerformance} />
              <HistoricalReturnsChart portfolioId={portfolioId} />
              <PortfolioPerformanceTableWithoutSSR
                data={filteredPerformance}
                emptyMessage={
                  holdingsFilter === "liquidated"
                    ? "No liquidated holdings found."
                    : holdingsFilter === "current"
                      ? "No current holdings found."
                      : "Please add a transaction to see the performance"
                }
              />
            </motion.div>
          </TabsContent>

          <TabsContent
            value="allocation"
            className="no-scrollbar mt-0 h-full overflow-y-auto px-2 py-2 md:px-3 md:py-3"
            ref={allocationRef}
          >
            <motion.div
              className="flex flex-col gap-2 pb-2"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <Allocation stocks={filteredPerformance} />
              <AllocationPerformance stocks={filteredPerformance} />
            </motion.div>
          </TabsContent>

          <TabsContent
            value="payouts"
            className="no-scrollbar mt-0 h-full overflow-y-auto px-2 py-2 md:px-3 md:py-3"
            ref={payoutsRef}
          >
            <motion.div
              className="flex flex-col gap-2 pb-2"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <UpcomingPayouts symbols={symbols} symbolToShares={symbolToShares} />
            </motion.div>
          </TabsContent>

          <TabsContent
            value="transactions"
            className="no-scrollbar mt-0 h-full overflow-y-auto px-2 py-2 md:px-3 md:py-3"
            ref={transactionsRef}
          >
            <motion.div
              className="flex h-full min-h-0 flex-col gap-4 pb-2 md:gap-5"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <TransactionsTableWithoutSSR portfolioId={portfolioId} />
            </motion.div>
          </TabsContent>
        </div>
      </div>

      <HideOnScroll visible={isFabVisible} className="fixed right-4 bottom-4 z-30 md:hidden">
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              aria-label="Open transaction actions"
              className="h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-lg transition-transform duration-200 active:scale-95 hover:bg-primary"
            >
              <Plus className="h-5 w-5" />
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" side="top" className="w-56 border-sidebar-border/70 bg-sidebar p-2">
            <div className="flex flex-col gap-2">
              <AddTransaction
                portfolioId={portfolioId}
                fullWidth
                wrapperClassName="w-full"
                buttonClassName="w-full justify-center !mb-0 !me-0"
              />
              <ImportTransactions
                fullWidth
                wrapperClassName="w-full"
                buttonClassName="w-full justify-center !mb-0 !me-0"
              />
            </div>
          </PopoverContent>
        </Popover>
      </HideOnScroll>
    </Tabs>
  );
}

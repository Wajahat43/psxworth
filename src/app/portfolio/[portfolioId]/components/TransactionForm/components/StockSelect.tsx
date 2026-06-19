"use client";

import { VirtualizedList } from "@/components/VirtualizedList";
import { Button } from "@/components/ui/button";
import { FormControl, FormItem, useFormField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { StockInfo } from "@/types";
import { STOCKS_INFO } from "@/utils/constants/stockSymbols";
import { ChevronsUpDown, Check, Search } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { ControllerRenderProps, FieldValues, Path, useFormContext } from "react-hook-form";

interface StockSelectProps<TFieldValues extends FieldValues> {
  field: ControllerRenderProps<TFieldValues, Path<TFieldValues>>;
}

export function StockSelect<TFieldValues extends FieldValues>({ field }: StockSelectProps<TFieldValues>) {
  "use no memo";
  const { error } = useFormField();
  const { clearErrors } = useFormContext<TFieldValues>();

  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const stocksInfo = STOCKS_INFO;
  const filteredStocks = !searchValue
    ? stocksInfo
    : stocksInfo.filter(
        (stock) =>
          stock.symbol.toLowerCase().includes(searchValue.toLowerCase()) ||
          stock.name.toLowerCase().includes(searchValue.toLowerCase())
      );

  const handleSelect = (stockSymbol: string) => {
    if (error) {
      clearErrors(field.name as Path<TFieldValues>);
    }

    field.onChange(stockSymbol);
    setOpen(false);
    setSearchValue("");
  };

  const renderStockItem = (stock: StockInfo) => {
    const isSelected = stock.symbol === field.value;

    return (
      <div
        className="flex items-center justify-between p-2 m-1 rounded-md text-slate-200 hover:ring-1 hover:ring-primary cursor-pointer transition-colors"
        onClick={() => handleSelect(stock.symbol)}
        role="option"
        aria-selected={isSelected}
      >
        <div className="flex flex-col">
          <span className="font-semibold">{stock.symbol}</span>
          <span className="text-sm font-medium text-gray-100/80 truncate">{stock.name}</span>
        </div>
        <Check className={cn("ml-auto h-4 w-4", isSelected ? "opacity-100" : "opacity-0")} />
      </div>
    );
  };

  return (
    <FormItem className="flex flex-col">
      <Popover open={open} onOpenChange={setOpen} modal={true}>
        <PopoverTrigger asChild>
          <FormControl>
            <Button
              variant="outline"
              role="combobox"
              className={cn(
                "px-2 w-full justify-between border-slate-700 bg-slate-800/60 text-slate-200 hover:bg-blue-900/40 hover:text-slate-100 backdrop-blur-sm",
                !field.value && "text-slate-400",
                error && "border-destructive"
              )}
              onClick={() => setOpen(!open)}
            >
              {field.value
                ? (() => {
                    const selectedStock = stocksInfo.find((stock) => stock.symbol === field.value);
                    return selectedStock ? (
                      <div className="flex gap-1 items-start">
                        <span className="font-semibold">{selectedStock.symbol}</span>
                        <span>-</span>
                        <span className="text-sm text-slate-400 hidden md:block">
                          {selectedStock.name.length > 25
                            ? `${selectedStock.name.slice(0, 25)}...`
                            : selectedStock.name}
                        </span>
                        <span className="text-sm text-slate-400 block md:hidden">{selectedStock.name}</span>
                      </div>
                    ) : (
                      field.value
                    );
                  })()
                : error
                  ? `Stock - ${error.message}`
                  : "Stock"}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </FormControl>
        </PopoverTrigger>
        <PopoverContent
          className="w-full p-0 bg-slate-900/90 border border-slate-700 shadow-md backdrop-blur-sm"
          side="bottom"
        >
          <div className="flex items-center border-b relative" cmdk-input-wrapper="">
            <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            <Input
              className={cn(
                "flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 border-none focus-visible:ring-0 focus-visible:ring-blue-500/20"
              )}
              onChange={(e) => setSearchValue(e.target.value)}
              value={searchValue}
            />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2, exit: { duration: 0.2 } }}
              className="relative"
            >
              <VirtualizedList
                items={filteredStocks}
                renderItem={renderStockItem}
                itemHeight={60}
                maxHeight="288px"
                className="min-w-80"
                loadingState={<div className="p-3 text-center text-slate-400">Loading stocks...</div>}
                emptyState={<div className="p-3 text-center text-slate-400">No stock found.</div>}
              />
            </motion.div>
          </AnimatePresence>
        </PopoverContent>
      </Popover>
    </FormItem>
  );
}

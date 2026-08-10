import { FloatingLabelTextarea } from "@/components/ui/floating-label-textarea";
import { LoadingGradientButton } from "@/components/ui/loading-gradient-button";
import { Zap, ShieldCheck } from "lucide-react";
import React, { useState } from "react";

interface TransactionInputProps {
  onSubmit: () => void;
  isLoading: boolean;
  initialData: string;
  onDataChange: (data: string) => void;
}

export function MultipleTransactionsInput({ onSubmit, isLoading, initialData, onDataChange }: TransactionInputProps) {
  const [inputData, setInputData] = useState(initialData);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputData.trim()) {
      onSubmit();
    }
  };

  const examplePlaceholder = `
Bought 100 shares of UBL at Rs. 1,450 each with Rs. 250 commission
LUCKY: purchased 50 shares @ Rs. 890.15 (fee: Rs. 200) - 2024-01-15
Dividend received: Rs. 25/share on 300 shares of PSO, total: Rs. 7,500 (no fees)
`;

  const id = React.useId();
  return (
    <form onSubmit={handleSubmit} className="space-y-6 md:mt-8 z-20" key={id}>
      <div className="flex items-center gap-6 md:hidden">
        <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-slate-500 font-medium">
          <Zap className="h-3.5 w-3.5 text-cyan-500" />
          <span>Supports any format</span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-slate-500 font-medium">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
          <span>AI Parsing</span>
        </div>
      </div>
      <div className="space-y-4">
        <FloatingLabelTextarea
          id="transaction-data"
          label="Paste your transactions here..."
          variant="filled"
          value={inputData}
          onChange={(e) => {
            setInputData(e.target.value);
            onDataChange(e.target.value);
          }}
          placeholder={examplePlaceholder}
          className="min-h-[300px] text-base leading-loose tracking-tight text-slate-200 font-mono"
          disabled={isLoading}
        />
      </div>

      <div className="flex items-center justify-between gap-4 px-1 mt-3">
        <div className="items-center gap-6 min-w-[60%] md:flex hidden">
          <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-slate-500 font-medium">
            <Zap className="h-3.5 w-3.5 text-cyan-500" />
            <span>Supports any format</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-slate-500 font-medium">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            <span>AI Parsing</span>
          </div>
        </div>

        <LoadingGradientButton
          type="submit"
          disabled={!inputData.trim()}
          isLoading={isLoading}
          variant="cyanBlue"
          fullWidth
          className="shadow-lg shadow-cyan-500/10"
          loadingMessages={[
            "Reading your broker paste",
            "Finding buys, sells & dividends",
            "Matching PSX tickers",
            "Pulling dates, prices & fees",
            "Polishing the results",
          ]}
        >
          Process Data
        </LoadingGradientButton>
      </div>
    </form>
  );
}

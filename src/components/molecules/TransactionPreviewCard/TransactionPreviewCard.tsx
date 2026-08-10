import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toLocalDate } from "@/types/localDate";
import { transactionSchema, TransactionSchemaType } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Edit3, Check, Plus, Loader2, CheckCircle, AlertCircle, Trash2 } from "lucide-react";
import React, { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { twMerge } from "tailwind-merge";
import { AnimateChangeInHeight } from "../AnimateChangeInHeight";
import { TransactionEditForm } from "../TransactionEditForm";
import { TransactionSummary } from "./TransactionSummary";

interface TransactionPreviewCardProps {
  transaction: TransactionSchemaType;
  isLoading: boolean;
  onUpdateTransaction: (updatedTransaction: TransactionSchemaType) => void;
  onSubmitTransaction: (transaction: TransactionSchemaType) => void;
  onRemoveTransaction: () => void;
  isProcessed: boolean;
}

export function TransactionPreviewCard({
  transaction,
  isLoading,
  onUpdateTransaction,
  onSubmitTransaction,
  onRemoveTransaction,
  isProcessed,
}: TransactionPreviewCardProps) {
  const [transactionState] = React.useState(transaction);
  const [isEditing, setIsEditing] = React.useState(false);

  const defaultValue = {
    // @ts-expect-error: 'isCommissionPercentage' is intentionally overwritten by spread.
    isCommissionPercentage: false,
    commissionAndTaxes: 0,
    ...transactionState,
  } as TransactionSchemaType;

  if (transactionState.transactionDate) {
    defaultValue.transactionDate = toLocalDate(transactionState.transactionDate);
  }

  const hookForm = useForm<TransactionSchemaType>({
    resolver: zodResolver(transactionSchema),
    defaultValues: defaultValue,
    mode: "onBlur",
  });

  const {
    control,
    watch,
  } = hookForm;

  const watchedTransaction = watch();
  const validationResult = transactionSchema.safeParse(watchedTransaction);

  /**
   * Give the updated transaction to the parent component. It can then use this for example, for checking
   * if all the transactions in a list are valid.
   */
  useEffect(() => {
    onUpdateTransaction(watchedTransaction);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(watchedTransaction)]);

  const isValid = validationResult.success;

  return (
    <FormProvider {...hookForm}>
      <AnimateChangeInHeight>
        <Card
          className={twMerge(
            "h-full shadow-sm border !bg-gray-900/60 text-slate-200 transition-colors rounded-md duration-200 !p-2 !md:p-2",
            !isValid ? "border-destructive/50 bg-destructive/5" : "border-slate-700",
            isProcessed ? "border-primary/40" : ""
          )}
        >
          <div className="flex items-center justify-between gap-2 md:gap-8">
            <TransactionSummary transaction={watchedTransaction} />
            <div className="flex items-center gap-1">
              {!isProcessed && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={onRemoveTransaction}
                      className="h-8 w-8 border-slate-700 bg-slate-800/60 text-slate-200 hover:bg-red-900/40 hover:text-red-100"
                      disabled={isLoading || isEditing}
                      aria-label="Remove transaction"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Remove</TooltipContent>
                </Tooltip>
              )}

              {!isProcessed && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setIsEditing(!isEditing)}
                      className="h-8 w-8 border-slate-700 bg-slate-800/60 text-slate-200 hover:bg-blue-900/40 hover:text-slate-100"
                      disabled={isLoading}
                      aria-label={isEditing ? "Done editing" : "Edit transaction"}
                    >
                      {isEditing ? <Check className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{isEditing ? "Done" : "Edit"}</TooltipContent>
                </Tooltip>
              )}

              <Tooltip>
                {/* Span wrapper so the tooltip still fires when the button is disabled
                    (disabled <button> elements swallow pointer events). */}
                <TooltipTrigger asChild>
                  <span className="inline-flex">
                    <Button
                      size="icon"
                      variant={isProcessed ? "default" : isValid ? "default" : "destructive"}
                      onClick={() => onSubmitTransaction(watchedTransaction)}
                      disabled={isLoading || !isValid || isEditing || isProcessed}
                      className={twMerge("h-8 w-8", isProcessed && "bg-background border-primary hover:bg-primary/80")}
                      aria-label={getButtonAriaLabel(isLoading, isValid, isProcessed, errors)}
                    >
                      {getButtonIcon(isLoading, isValid, isProcessed)}
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent className="max-w-[240px]">
                  {getButtonTooltip(isLoading, isValid, isProcessed, errors)}
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          {isEditing && !isProcessed && (
            <TransactionEditForm transaction={watchedTransaction} control={control} watch={watch} />
          )}
        </Card>
      </AnimateChangeInHeight>
    </FormProvider>
  );
}

type ErrorsRecord = Partial<Record<string, { message?: string } | undefined>>;

const FIELD_LABELS: Record<string, string> = {
  stockSymbol: "Stock symbol",
  numberOfShares: "Number of shares",
  pricePerShare: "Price per share",
  dividendPerShare: "Dividend per share",
  transactionDate: "Transaction date",
  commissionAndTaxes: "Commission/taxes",
};

function getInvalidFieldMessages(errors: ErrorsRecord): string[] {
  return Object.entries(errors).flatMap(([field, error]) => {
    if (!error) return [];
    const label = FIELD_LABELS[field] ?? field;
    return [error.message ? `${label}: ${error.message}` : label];
  });
}

function getButtonIcon(isLoading: boolean, isValid: boolean, isProcessed: boolean) {
  if (isLoading) return <Loader2 className="h-4 w-4 animate-spin" />;
  if (isProcessed) return <CheckCircle className="h-4 w-4" />;
  if (!isValid) return <AlertCircle className="h-4 w-4" />;
  return <Plus className="h-4 w-4" />;
}

function getButtonAriaLabel(isLoading: boolean, isValid: boolean, isProcessed: boolean, errors: ErrorsRecord) {
  if (isLoading) return "Adding…";
  if (isProcessed) return "Added";
  if (!isValid) {
    const messages = getInvalidFieldMessages(errors);
    return messages.length ? `Invalid: ${messages.join("; ")}` : "Invalid — fix errors to add";
  }
  return "Add transaction";
}

function getButtonTooltip(isLoading: boolean, isValid: boolean, isProcessed: boolean, errors: ErrorsRecord) {
  if (isLoading) return "Adding…";
  if (isProcessed) return "Added";
  if (isValid) return "Add transaction";

  const messages = getInvalidFieldMessages(errors);
  if (!messages.length) return "Fix the highlighted errors to add this transaction";

  return (
    <div className="flex flex-col gap-0.5">
      <span className="font-medium">Fix to add:</span>
      {messages.map((m) => (
        <span key={m}>• {m}</span>
      ))}
    </div>
  );
}

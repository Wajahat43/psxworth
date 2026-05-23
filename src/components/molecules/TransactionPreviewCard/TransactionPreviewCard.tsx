import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toLocalDate } from "@/types/localDate";
import { transactionSchema, TransactionSchemaType } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Edit3, Check, Database, Loader2, CheckCircle, AlertCircle, Trash2 } from "lucide-react";
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
    formState: { errors },
    clearErrors,
  } = hookForm;

  const watchedTransaction = watch();

  /**
   * Clear stock symbol errors whenever the value changes (including emptying the field)
   * to avoid stale/persistent errors caused by overlapping programmatic validations.
   * Rely on user-driven validation (`mode: "onBlur"`) to perform actual validation.
   */
  useEffect(() => {
    clearErrors("stockSymbol");
  }, [watchedTransaction.stockSymbol, clearErrors]);

  /**
   * Give the updated transaction to the parent component. It can then use this for example, for checking
   * if all the transactions in a list are valid.
   */
  useEffect(() => {
    onUpdateTransaction(watchedTransaction);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(watchedTransaction)]);

  const validationErrors = Object.keys(errors).length;
  const isValid = !validationErrors;

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
          <div className="flex items-center justify-between gap-2 md:gap-12">
            <TransactionSummary transaction={watchedTransaction} />
            <div className="flex items-center gap-2 flex-col-reverse md:flex-row">
              {!isProcessed && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRemoveTransaction}
                  className="flex items-center gap-2 border-slate-700 bg-slate-800/60 text-slate-200 hover:bg-red-900/40 hover:text-red-100"
                  disabled={isLoading || isEditing}
                >
                  <Trash2 className="h-3 w-3" />
                  Remove
                </Button>
              )}

              {!isProcessed && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center gap-2 border-slate-700 bg-slate-800/60 text-slate-200 hover:bg-blue-900/40 hover:text-slate-100"
                  disabled={isLoading}
                >
                  {isEditing ? (
                    <>
                      <Check className="h-3 w-3" />
                      Done
                    </>
                  ) : (
                    <>
                      <Edit3 className="h-3 w-3" />
                      Edit
                    </>
                  )}
                </Button>
              )}

              <Button
                size="sm"
                variant={isProcessed ? "default" : isValid ? "default" : "destructive"}
                onClick={() => onSubmitTransaction(watchedTransaction)}
                disabled={isLoading || !isValid || isEditing || isProcessed}
                className={isProcessed ? "bg-background border-primary hover:bg-primary/80" : ""}
              >
                {getButtonContent(isLoading, isValid, isProcessed)}
              </Button>
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

function getButtonContent(isLoading: boolean, isValid: boolean, isProcessed: boolean) {
  if (isLoading) {
    return <Loader2 className="h-3 w-3 animate-spin" />;
  }

  if (!isValid) {
    return (
      <>
        <AlertCircle className="h-3 w-3 mr-1" />
        Invalid
      </>
    );
  }

  if (isProcessed) {
    return (
      <>
        <CheckCircle className="h-3 w-3 mr-1" />
        Added
      </>
    );
  }

  return (
    <>
      <Database className="h-3 w-3 mr-1" />
      Add
    </>
  );
}

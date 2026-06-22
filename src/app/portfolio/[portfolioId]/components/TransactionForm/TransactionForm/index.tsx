"use client";

import { Form, FormField } from "@/components/ui/form";
import { toLocalDate } from "@/types/localDate";
import {
  BuyTransactionSchemaType,
  SellTransactionSchemaType,
  DividendTransactionSchemaType,
  Transaction,
  transactionSchema,
  DividendTransaction,
  BuyTransaction,
  SellTransaction,
} from "@/types";
import { useTransactions } from "@/utils/hooks/useTransactionData";
import { useUserSettings } from "@/utils/hooks/useUserSettings";
import { usePortfolio } from "@/utils/hooks/usePortfolio";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { StockSelect } from "../components/StockSelect";
import {
  DateInput,
  NoteInput,
  CommissionInput,
  SharesCountInput,
  PricePerShareInput,
  DividendPerShareInput,
  TransactionTypeSelector,
} from "../components/TransactionFormFields";
import { TransactionSubmitButton } from "../components/TransactionSubmitButton";
import { TransactionSummary } from "../components/TransactionSummary";

interface TransactionFormProps {
  onSuccess?: () => void;
  portfolioId: number;
  editTransaction?: Transaction;
  editTransactionId?: number;
}

export default function TransactionForm(props: TransactionFormProps) {
  "use no memo";

  const { onSuccess, portfolioId, editTransaction, editTransactionId } = props;

  const { createTransaction, updateTransaction } = useTransactions(portfolioId);
  const { settings } = useUserSettings();
  const { portfolios } = usePortfolio();

  // Get the appropriate schema and type based on transaction type
  const editTransactionType = editTransaction?.type || "buy";
  const priceOrDividend =
    editTransactionType === "dividend"
      ? { dividendPerShare: (editTransaction as DividendTransaction)?.dividendPerShare }
      : { pricePerShare: (editTransaction as BuyTransaction | SellTransaction)?.pricePerShare };

  const baseDefaults = {
    note: editTransaction?.note ?? "",
    portfolioId,
    stockSymbol: editTransaction?.stockSymbol ?? "",
    numberOfShares: editTransaction?.numberOfShares,
    transactionDate: editTransaction?.transactionDate
      ? toLocalDate(editTransaction.transactionDate)
      : toLocalDate(new Date()),
    commissionAndTaxes: editTransaction?.commissionAndTaxes,
    isCommissionPercentage: editTransaction?.isCommissionPercentage ?? false,
    type: editTransactionType,
    ...priceOrDividend,
  };
  const form = useForm<BuyTransactionSchemaType | SellTransactionSchemaType | DividendTransactionSchemaType>({
    resolver: zodResolver(transactionSchema),
    defaultValues: baseDefaults,
    mode: "onSubmit",
  });

  const transactionType = form.watch("type");
  const isDividend = transactionType === "dividend";
  const { dirtyFields } = form.formState;

  // Automatically pre-fill default values from settings when transaction type changes
  useEffect(() => {
    if (editTransactionId) return; // Do not overwrite values during edit flow

    const portfolio = portfolios?.find((p) => p.id === portfolioId);
    let effectiveTaxStatus: "filer" | "non-filer" = "filer";
    if (portfolio && !portfolio.useGlobalTax) {
      effectiveTaxStatus = portfolio.taxStatus;
    } else if (settings) {
      effectiveTaxStatus = settings.taxStatus;
    }

    if (transactionType === "dividend") {
      if (!dirtyFields.commissionAndTaxes) {
        form.setValue("commissionAndTaxes", effectiveTaxStatus === "filer" ? 15 : 30);
      }
      if (!dirtyFields.isCommissionPercentage) {
        form.setValue("isCommissionPercentage", true);
      }
    } else if (transactionType === "buy" || transactionType === "sell") {
      if (!dirtyFields.commissionAndTaxes) {
        form.setValue("commissionAndTaxes", settings ? settings.commissionRate : 0.15);
      }
      if (!dirtyFields.isCommissionPercentage) {
        form.setValue("isCommissionPercentage", settings ? settings.isCommissionPercentage : true);
      }
    }
  }, [
    transactionType,
    settings,
    portfolios,
    portfolioId,
    editTransactionId,
    form,
    dirtyFields.commissionAndTaxes,
    dirtyFields.isCommissionPercentage,
  ]);

  const onSubmit = async (
    data: BuyTransactionSchemaType | SellTransactionSchemaType | DividendTransactionSchemaType
  ) => {
    if (editTransactionId) {
      updateTransaction.mutate(
        { transactionId: editTransactionId, transactionData: data },
        {
          onSuccess: () => {
            onSuccess?.();
          },
        }
      );
    } else {
      createTransaction.mutate(data, {
        onSuccess: () => {
          onSuccess?.();
        },
      });
    }
  };

  return (
    <Form {...form}>
      <form className="space-y-3 max-w-3xl mx-auto" onSubmit={form.handleSubmit(onSubmit)}>
        {/* Transaction Type Selector */}
        <TransactionTypeSelector setValue={form.setValue} watch={form.watch} isEditing={false} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <FormField
            control={form.control}
            name="transactionDate"
            render={({ field }) => <DateInput field={field} />}
          />
          <FormField control={form.control} name="stockSymbol" render={({ field }) => <StockSelect field={field} />} />
        </div>

        <FormField
          control={form.control}
          name="numberOfShares"
          render={({ field }) => <SharesCountInput field={field} />}
        />

        {/* Conditionally render pricePerShare for buy/sell or dividendPerShare for dividend */}
        {isDividend ? (
          <FormField
            control={form.control}
            name="dividendPerShare"
            render={({ field }) => <DividendPerShareInput field={field} />}
          />
        ) : (
          <FormField
            control={form.control}
            name="pricePerShare"
            render={({ field }) => <PricePerShareInput field={field} />}
          />
        )}

        <FormField
          control={form.control}
          name="commissionAndTaxes"
          render={({ field }) => (
            <FormField
              control={form.control}
              name="isCommissionPercentage"
              render={({ field: toggleField }) => (
                <CommissionInput
                  field={field}
                  /* eslint-disable-next-line react-hooks/incompatible-library -- React Hook Form's watch() cannot be memoized safely; React Compiler skips this component */
                  isPercentage={form.watch("isCommissionPercentage")}
                  toggleField={toggleField}
                />
              )}
            />
          )}
        />

        <FormField control={form.control} name="note" render={({ field }) => <NoteInput field={field} />} />

        <TransactionSummary
          transactionType={transactionType}
          stockSymbol={form.watch("stockSymbol")}
          numberOfShares={form.watch("numberOfShares")}
          pricePerShare={!isDividend ? form.watch("pricePerShare") : undefined}
          dividendPerShare={isDividend ? form.watch("dividendPerShare") : undefined}
          commissionAndTaxes={form.watch("commissionAndTaxes")}
          isCommissionPercentage={form.watch("isCommissionPercentage")}
        />

        <TransactionSubmitButton
          transactionType={transactionType}
          isPending={createTransaction.isPending || updateTransaction.isPending}
          isEditFlow={!!editTransaction}
        />
      </form>
    </Form>
  );
}

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
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import { useDividendSharesAutoFill } from "@/utils/hooks/useDividendSharesAutoFill";
import { useEffect, useRef } from "react";

interface TransactionFormProps {
  onSuccess?: () => void;
  portfolioId: number;
  editTransaction?: Transaction;
  editTransactionId?: number;
}

export default function TransactionForm(props: TransactionFormProps) {
  "use no memo";

  const { onSuccess, portfolioId, editTransaction, editTransactionId } = props;

  const { createTransaction, updateTransaction, transactions } = useTransactions(portfolioId);

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
  

  const stockSymbol = form.watch("stockSymbol");

const autoFilledShares = useDividendSharesAutoFill(
  stockSymbol,
  isDividend,
  transactions.data ?? []
);

const hasUserEdited = useRef(false);

useEffect(() => {
  hasUserEdited.current = false;
}, [stockSymbol, isDividend]);

useEffect(() => {
  if (editTransaction) return;

  if (!hasUserEdited.current) {
    if (autoFilledShares !== null) {
      form.setValue("numberOfShares", autoFilledShares);
    } else {
      form.setValue("numberOfShares", 0);
    }
  }
}, [autoFilledShares, editTransaction, form]);

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
          render={({ field }) => (
            <SharesCountInput
              field={{
                ...field,
                onChange: (e) => {
                  hasUserEdited.current = true;
                  field.onChange(e);
                },
              }}
            />
          )}
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

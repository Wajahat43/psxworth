import { TransactionPreviewCard } from "@/components/molecules/TransactionPreviewCard/TransactionPreviewCard";
import { Button } from "@/components/ui/button";
import { transactionSchema, TransactionSchemaType } from "@/types";
import { useTransactions } from "@/utils/hooks/useTransactionData";
import { CheckCircle, ArrowLeft, Loader2, Database, FileX } from "lucide-react";
import { useParams } from "next/navigation";
import React, { useState } from "react";

interface MultipleTransactionReviewProps {
  transactions: TransactionSchemaType[];
  onPrevious: () => void;
  onClose?: () => void;
}

interface ReviewTransaction {
  reviewId: string;
  transaction: TransactionSchemaType;
}

const createReviewId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
};

const toReviewTransactions = (transactions: TransactionSchemaType[]): ReviewTransaction[] =>
  transactions.map((transaction) => ({
    reviewId: createReviewId(),
    transaction,
  }));

export function MultipleTransactionsReview({ transactions, onPrevious, onClose }: MultipleTransactionReviewProps) {
  const [reviewTransactions, setReviewTransactions] = useState<ReviewTransaction[]>(() =>
    toReviewTransactions(transactions)
  );
  const [submittedTransactions, setSubmittedTransactions] = useState<Set<string>>(new Set());

  const params = useParams();
  const portfolioId = Number(params.portfolioId);
  const { createTransaction, createMultipleTransactions } = useTransactions(portfolioId);

  const validateTransaction = (transaction: TransactionSchemaType) => {
    const result = transactionSchema.safeParse(transaction);
    if (result.success) {
      return { isValid: true, missingFields: [] };
    }

    const missingFields = Object.keys(result.error.flatten().fieldErrors);
    return {
      isValid: false,
      missingFields,
    };
  };

  const canSubmitTransaction = (transaction: TransactionSchemaType) => {
    return validateTransaction(transaction).isValid;
  };

  const handleCreateTransaction = (reviewId: string, transaction: TransactionSchemaType) => {
    if (!canSubmitTransaction(transaction)) return;

    createTransaction.mutate(transaction, {
      onSuccess: () => {
        setSubmittedTransactions((prevSubmitted) => {
          const newSubmitted = new Set(prevSubmitted);
          newSubmitted.add(reviewId);
          return newSubmitted;
        });
      },
    });
  };

  const handleSubmitAll = () => {
    const transactionsToSubmit = reviewTransactions
      .filter(({ reviewId }) => !submittedTransactions.has(reviewId))
      .map(({ transaction }) => transaction);

    if (!transactionsToSubmit.length) return;

    createMultipleTransactions.mutate(transactionsToSubmit, {
      /**
       * After submitting all transactions successfully, update the list of submitted transactions to include all transactions.
       * This is so that the "Submit All" button is disabled and the "Go Back" button is enabled.
       */

      onSuccess: () => {
        setSubmittedTransactions(new Set(reviewTransactions.map(({ reviewId }) => reviewId)));
      },
    });
  };

  const canSubmitAll = () => {
    return reviewTransactions.every(({ transaction }) => canSubmitTransaction(transaction));
  };

  const handleRemoveTransaction = (reviewId: string) => {
    setReviewTransactions((prevTransactions) =>
      prevTransactions.filter((transaction) => transaction.reviewId !== reviewId)
    );
    setSubmittedTransactions((prevSubmitted) => {
      if (!prevSubmitted.has(reviewId)) return prevSubmitted;

      const newSubmitted = new Set(prevSubmitted);
      newSubmitted.delete(reviewId);
      return newSubmitted;
    });
  };

  const hasTransactions = reviewTransactions.length > 0;
  const allSubmitted =
    hasTransactions && reviewTransactions.every(({ reviewId }) => submittedTransactions.has(reviewId));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h3 className="text-lg font-semibold text-slate-100">Transaction Review</h3>
          <p className="text-sm text-slate-400">Review your transactions and complete any missing information</p>
        </div>
      </div>

      <div className="space-y-4 overflow-y-auto max-h-[55vh] -mx-2 px-2">
        {!hasTransactions && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FileX className="h-12 w-12 text-slate-500 mb-4" />
            <h4 className="text-lg font-medium text-slate-300">No transactions to process</h4>
            <p className="text-sm text-slate-500 mt-1">All transactions have been removed from the list</p>
          </div>
        )}
        {reviewTransactions.map(({ reviewId, transaction }) => (
          <TransactionPreviewCard
            key={reviewId}
            transaction={{
              ...transaction,
            }}
            isLoading={createTransaction.isPending || createMultipleTransactions.isPending}
            onUpdateTransaction={(updatedTransaction) => {
              setReviewTransactions((prevTransactions) =>
                prevTransactions.map((currentTransaction) =>
                  currentTransaction.reviewId === reviewId
                    ? { ...currentTransaction, transaction: updatedTransaction }
                    : currentTransaction
                )
              );
            }}
            onSubmitTransaction={(updatedTransaction) => handleCreateTransaction(reviewId, updatedTransaction)}
            onRemoveTransaction={() => handleRemoveTransaction(reviewId)}
            isProcessed={submittedTransactions.has(reviewId)}
          />
        ))}
      </div>

      <div className="flex justify-between items-center gap-2 flex-shrink-0 border-t border-slate-700 pt-4">
        <Button
          variant="outline"
          onClick={allSubmitted && onClose ? onClose : onPrevious}
          className="flex items-center gap-2 border-slate-700 bg-slate-800/60 text-slate-200 hover:bg-blue-900/40 hover:text-slate-100"
          disabled={false}
        >
          {allSubmitted && onClose ? null : <ArrowLeft className="h-4 w-4" />}
          {allSubmitted && onClose ? "Close" : "Previous"}
        </Button>

        {allSubmitted && (
          <div className="bg-background text-foreground px-4 py-2 rounded flex items-center">
            <CheckCircle className="h-4 w-4 mr-2" />
            All transactions successfully added to database
          </div>
        )}

        {!allSubmitted && (
          <div className="flex flex-col items-end gap-2">
            <Button
              onClick={handleSubmitAll}
              disabled={createMultipleTransactions.isPending || !canSubmitAll() || !hasTransactions}
              variant={canSubmitAll() && hasTransactions ? "default" : "outline"}
              className={
                canSubmitAll() && hasTransactions
                  ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                  : "border-slate-700 bg-slate-800/60 text-slate-400"
              }
              size="lg"
            >
              {createMultipleTransactions.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Adding All...
                </>
              ) : (
                <>
                  <Database className="h-4 w-4" />
                  Add All Transactions
                </>
              )}
            </Button>
            {!hasTransactions && (
              <p className="text-xs text-slate-500 text-center">No transactions available to submit</p>
            )}
            {hasTransactions && !canSubmitAll() && (
              <p className="text-xs text-destructive text-center">Complete all missing fields to submit</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default MultipleTransactionsReview;

"use client";

import { TransactionFormDialog } from "@/app/portfolio/[portfolioId]/components/TransactionForm/TransactionFormDialog/TransactionFormDialog";
import { ConfirmationDialog } from "@/components/molecules/ConfirmationDialog";
import { Button } from "@/components/ui/button";
import SpinningLoader from "@/components/ui/spinning-loader";
import { Transaction } from "@/types";
import { useTransactions } from "@/utils/hooks/useTransactionData";
import { Edit, Trash2 } from "lucide-react";
import React from "react";

interface TransactionActionsProps {
  transaction: Transaction;
}
export const TransactionActions = (props: TransactionActionsProps) => {
  const { transaction } = props;
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);

  const portfolioId = transaction.portfolioId;
  const { deleteTransaction } = useTransactions(portfolioId);
  const onConfirmDelete = () => deleteTransaction.mutate({ transactionId: transaction.id, portfolioId });

  const handleEdit = () => setIsEditDialogOpen(true);

  return (
    <div className="flex gap-2" onClick={(event) => event.stopPropagation()}>
      <Button
        type="button"
        size="icon"
        onClick={handleEdit}
        className="!h-8 !w-8 !rounded-full !bg-slate-700/50 hover:!bg-blue-500/30 transition-colors !ring-1 !ring-slate-600/50 hover:!ring-blue-500/70"
      >
        <Edit size={14} className="text-slate-300" />
      </Button>
      <ConfirmationDialog
        title="Are you sure?"
        description="This will permanently delete your transaction and remove it from your portfolio."
        onConfirm={onConfirmDelete}
        useHoldToConfirm
        holdDuration={700}
        trigger={
          <Button
            asChild
            size="icon"
            className="!h-8 !w-8 !rounded-full !bg-slate-700/50 hover:!bg-red-500/30 transition-colors !ring-1 !ring-slate-600/50 hover:!ring-red-500/70"
          >
            <span>
              {deleteTransaction.isPending ? (
                <SpinningLoader size="xxs" color="red" />
              ) : (
                <Trash2 size={14} className="text-slate-300" />
              )}
            </span>
          </Button>
        }
      />
      <TransactionFormDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        portfolioId={portfolioId}
        editTransaction={transaction}
      />
    </div>
  );
};

export default TransactionActions;

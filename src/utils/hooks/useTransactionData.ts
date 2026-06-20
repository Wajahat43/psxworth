"use client";

import {
  createMultipleTransactions,
  createTransactionServer,
  deleteTransaction,
  editTransaction,
  getTransactions,
  getAllTransactions
} from "@/actions/transaction/TransactionFunctions";
import { historicalReturnsQueries } from "@/features/historicalReturns/queries";
import { toast } from "@/components/molecules/Toast";
import { Transaction, TransactionSchemaType } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { handleServerPromise } from "../helpers";

export const useTransactions = (
  portfolioId: number,
  page: number = 1,
  pageSize: number = 10,
  filters?: { types?: string[]; symbols?: string[] },
  sorting?: { key: string; order: string } | null,
  fetchPaginated: boolean = false
) => {
  const queryClient = useQueryClient();

  const transactions = useQuery({
    queryKey: ["transactions", portfolioId, page, pageSize, filters, sorting],
    queryFn: async () => {
      const result = await getTransactions(portfolioId, page, pageSize, filters, sorting );
      if (result.success) {
        return result.data as unknown as {
          items: Transaction[];
          totalCount: number;
          page: number;
          pageSize: number;
          totalPages: number;
          availableSymbols:{stockSymbol:string}[]


        };
      }
      throw new Error(result.message);
    },
    enabled: !!portfolioId && fetchPaginated,
    staleTime: 5 * 60 * 1000, // 5 minutes - data is considered fresh for 5 minutes
  });

  const AllTransactions = useQuery({
    queryKey: ["transactions", portfolioId, "all",filters],
    queryFn: async () => {
      const result = await getAllTransactions(portfolioId,filters);
      if (result.success) {
        return result.data as unknown as {
          items: Transaction[]
        }
      } else {
        toast({ title: result.message || "An error occurred", type: "error" });
        return null

      }
    },
    enabled: false,
  });

  const invalidateQueries = () => {
    queryClient.invalidateQueries({
      queryKey: ["transactions", portfolioId],
    });
    queryClient.invalidateQueries({
      queryKey: ["user", portfolioId, "performance"],
    });
    queryClient.invalidateQueries({
      queryKey: historicalReturnsQueries.allKey(),
    });
  };

  const createTransactionMutation = useMutation({
    mutationFn: createTransactionServer,
    onSuccess: (data) => {
      if (data.success) {
        toast({ title: "Transaction created successfully", type: "success" });
        invalidateQueries();
      } else {
        toast({ title: data.message || "Failed to create transaction", type: "error" });
      }
    },
    onError: (error) => {
      toast({ title: error.message || "An error occurred", type: "error" });
    },
  });

  const createMultipleTransactionsMutation = useMutation({
    mutationFn: createMultipleTransactions,
    onSuccess: (data) => {
      if (data.success) {
        toast({ title: "Transactions created successfully", type: "success" });
        invalidateQueries();
      } else {
        throw new Error(data.message);
      }
    },
    onError: (error) => {
      toast({ title: error.message || "An error occurred", type: "error" });
    },
  });

  const updateTransactionMutation = useMutation({
    mutationFn: ({
      transactionId,
      transactionData,
    }: {
      transactionId: number;
      transactionData: TransactionSchemaType;
    }) => handleServerPromise(editTransaction(transactionId, transactionData)),
    onSuccess: () => {
      toast({ title: "Transaction updated successfully", type: "success" });
      invalidateQueries();
    },
    onError: (error: Error) => {
      toast({ title: error.message || "An error occurred", type: "error" });
    },
  });

  const deleteTransactionMutation = useMutation({
    mutationFn: ({ transactionId, portfolioId }: { transactionId: number; portfolioId: number }) =>
      handleServerPromise(deleteTransaction(transactionId, portfolioId)),
    onSuccess: () => {
      toast({ title: "Transaction deleted successfully", type: "success" });
      invalidateQueries();
    },
    onError: (error: Error) => {
      toast({ title: error.message || "An error occurred", type: "error" });
    },
  });

  return {
    AllTransactions,
    transactions,
    createTransaction: createTransactionMutation,
    createMultipleTransactions: createMultipleTransactionsMutation,
    updateTransaction: updateTransactionMutation,
    deleteTransaction: deleteTransactionMutation,
  };
};

import { createPortfolio, getPortfolios, updatePortfolio } from "@/actions/portfolio/portfolioActions";
import { toast } from "@/components/molecules/Toast";
import { Portfolio } from "@/db/schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { handleServerPromise } from "../helpers/server";

export const usePortfolio = () => {
  const queryClient = useQueryClient();

  const portfolios = useQuery({
    queryKey: ["portfolios"],
    queryFn: async () => {
      const result = await getPortfolios();
      if (result.success && result.data) {
        return result.data as Portfolio[];
      }
      throw new Error(result.message || "Failed to load portfolios");
    },
    staleTime: 5 * 60 * 1000,
  });

  const createPortfolioMutation = useMutation({
    mutationFn: (data: Omit<Portfolio, "userId" | "createdAt" | "updatedAt" | "id">) =>
      handleServerPromise(createPortfolio(data)),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["portfolios"] });
      toast({
        type: "success",
        title: "Portfolio Created Successfully.",
        description: "You can now add transactions.",
      });
      return data;
    },
    onError: (error) => {
      toast({ title: error.message, type: "error" });
    },
  });

  const updatePortfolioMutation = useMutation({
    mutationFn: (data: Portfolio) => handleServerPromise(updatePortfolio(data)),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["portfolios"] });
      toast({
        type: "success",
        title: "Portfolio Updated Successfully.",
      });
      return data;
    },
    onError: (error) => {
      toast({ title: error.message, type: "error" });
    },
  });

  return {
    portfolios: portfolios.data ?? [],
    isLoadingPortfolios: portfolios.isLoading,
    createPortfolioMutation,
    updatePortfolioMutation,
  };
};

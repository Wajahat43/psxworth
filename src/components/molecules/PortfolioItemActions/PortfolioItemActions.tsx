"use client";

import { deleteLastActivePortfolioCookie } from "@/actions/cookies/lastActivePortfolio";
import { deletePortfolioAction } from "@/actions/portfolio/portfolioActions";
import { CreatePortfolioDialog } from "@/app/portfolio/[portfolioId]/components/CreatePortfolioDialog";
import { ConfirmationDialog } from "@/components/molecules/ConfirmationDialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import SpinningLoader from "@/components/ui/spinning-loader";
import { Portfolio } from "@/db/schema";
import { useHoldingsFilter, usePortfolioStore } from "@/store";
import { PORTFOLIO_DELETED } from "@/utils/posthog/events";
import { Edit3, MoreHorizontal, Trash2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import posthog from "posthog-js";
import { useState } from "react";
import { twMerge } from "tailwind-merge";
import { toast } from "../Toast";
import { useQueryClient } from "@tanstack/react-query";

interface PortfolioItemActionsProps {
  portfolio: Portfolio;
  className?: string;
}

const PortfolioItemActions = ({ portfolio, className }: PortfolioItemActionsProps) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();

  const holdingsFilter = useHoldingsFilter(portfolio.id);
  const setHoldingsFilter = usePortfolioStore((state) => state.setHoldingsFilter);

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const response = await deletePortfolioAction(portfolio.id);
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ["portfolios"] });
        toast({
          type: "success",
          title: "Portfolio Deleted Successfully",
        });
        posthog.capture(PORTFOLIO_DELETED);

        if (pathname.includes(portfolio.id.toString())) {
          await deleteLastActivePortfolioCookie();
          router.push("/portfolio");
        }
      } else {
        toast({
          type: "error",
          title: response.message,
        });
      }
    } catch (error: any) {
      toast({
        type: "error",
        title: "Failed to delete Portfolio",
      });
      posthog.captureException(error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div
        className={twMerge("flex gap-2", className)}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-slate-400 transition-opacity duration-200 hover:text-slate-100 hover:bg-slate-700"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72 bg-slate-800 border-slate-700">
            <div className="mb-2 px-2 py-2 space-y-2">
              <p className="text-sm text-foreground">Holdings Filter</p>
              <Select
                value={holdingsFilter}
                onValueChange={(value) => {
                  if (value === "all" || value === "current" || value === "liquidated") {
                    setHoldingsFilter(portfolio.id, value);
                  }
                }}
              >
                <SelectTrigger className="w-full bg-slate-700 border-slate-600 text-gray-100 text-sm">
                  <SelectValue placeholder="Filter holdings" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  <SelectItem value="all" className="text-gray-100 hover:bg-slate-700">
                    All holdings
                  </SelectItem>
                  <SelectItem value="current" className="text-gray-100 hover:bg-slate-700">
                    Current holdings
                  </SelectItem>
                  <SelectItem value="liquidated" className="text-gray-100 hover:bg-slate-700">
                    Liquidated holdings
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DropdownMenuSeparator className="bg-slate-700" />

            <DropdownMenuItem
              onClick={() => setIsEditDialogOpen(true)}
              className="text-slate-200 hover:bg-slate-700 cursor-pointer"
            >
              <Edit3 className="mr-2 h-4 w-4" />
              Edit Portfolio
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-slate-700" />
            <ConfirmationDialog
              title="Delete Portfolio"
              description="This action cannot be undone. This will permanently delete your portfolio and all its data."
              confirmText="Delete"
              onConfirm={handleDelete}
              useHoldToConfirm
              holdDuration={1000}
              trigger={
                <DropdownMenuItem
                  onSelect={(e) => e.preventDefault()}
                  className="text-red-400 hover:bg-red-500/10 hover:text-red-300 cursor-pointer"
                >
                  {isDeleting ? <SpinningLoader size="xxs" color="red" /> : <Trash2 className="mr-2 h-4 w-4" />}
                  Delete Portfolio
                </DropdownMenuItem>
              }
            />
          </DropdownMenuContent>
        </DropdownMenu>

        <CreatePortfolioDialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} portfolio={portfolio} />
      </div>
    </>
  );
};

export default PortfolioItemActions;

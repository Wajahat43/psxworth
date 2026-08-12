"use client";

import { parseRawTransactions } from "@/actions/transaction/TransactionFunctions";
import { AnimateChangeInHeight } from "@/components/molecules/AnimateChangeInHeight";
import { MultipleTransactionsInput } from "@/components/molecules/MultipleTransactionsInput/MultipleTransactionsInput";
import { toast } from "@/components/molecules/Toast";
import MultipleTransactionsReview from "@/components/organisms/ImportTransactions/components/MultipleTransactionsReview/MultipleTransactionsReview";
import { Card } from "@/components/ui/card";
import { TransactionSchemaType } from "@/types";
import { usePortfolio } from "@/utils/hooks/usePortfolio";
import { useUserSettings } from "@/utils/hooks/useUserSettings";
import { useParams } from "next/navigation";
import posthog from "posthog-js";
import React, { useState } from "react";
import { twMerge } from "tailwind-merge";

const steps = [
  { id: 1, title: "Input Data" },
  { id: 2, title: "Review & Submit" },
];

interface ImportTransactionsContentProps {
  onCloseDialog?: () => void;
}

export function ImportTransactionsContent({ onCloseDialog }: ImportTransactionsContentProps) {
  const [currentStep, setCurrentStep] = useState(1);

  const [transactionData, setTransactionData] = useState<TransactionSchemaType[] | null>(null);
  const [reviewVersion, setReviewVersion] = useState(0);
  const [inputFormData, setInputFormData] = useState<string>(""); // New state for input data

  const [isLoading, setIsLoading] = useState(false);

  const params = useParams<{ portfolioId: string }>();
  const portfolioId = parseInt(params.portfolioId, 10);

  const { settings, isLoading: isLoadingSettings } = useUserSettings();
  const { portfolios, isLoadingPortfolios } = usePortfolio();

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep((prevStep) => prevStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((prevStep) => prevStep - 1);
    }
  };

  const handleInputDataChange = (data: string) => {
    setInputFormData(data);
  };

  const getStepClasses = (stepNumber: number) => {
    const baseClasses = "w-full transition-all duration-300 ease-in-out";

    if (currentStep === stepNumber) {
      return twMerge(baseClasses, "opacity-100 translate-x-0 relative");
    }

    if (stepNumber === 1) {
      // Step 1: when not active, it's positioned to the left (user went forward)
      return twMerge(baseClasses, "opacity-0 -translate-x-full absolute top-0 left-0 pointer-events-none");
    }

    if (stepNumber === 2) {
      // Step 2: when not active, it's positioned to the right (waiting to come in)
      return twMerge(baseClasses, "opacity-0 translate-x-full absolute top-0 left-0 pointer-events-none");
    }

    return baseClasses;
  };

  const handleDataSubmit = async () => {
    if (isLoadingSettings || isLoadingPortfolios) {
      toast({
        type: "error",
        title: "Loading data",
        description: "Please wait while settings and portfolios are loading.",
      });
      return;
    }
    // Modified to use inputFormData
    setIsLoading(true);
    try {
      const response = await parseRawTransactions(inputFormData);

      if (response.success && response.data) {
        const portfolio = portfolios?.find((p) => p.id === portfolioId);
        let effectiveTaxStatus: "filer" | "non-filer" = "filer";
        if (portfolio && !portfolio.useGlobalTax) {
          effectiveTaxStatus = portfolio.taxStatus;
        } else if (settings) {
          effectiveTaxStatus = settings.taxStatus;
        }

        //Attach portfolio ID with each transaction.
        response.data.forEach((transaction: any) => {
          transaction.portfolioId = portfolioId;

          // Compute and pre-fill commission & taxes if not parsed or is 0
          if (
            transaction.commissionAndTaxes === undefined ||
            transaction.commissionAndTaxes === null ||
            transaction.commissionAndTaxes === 0
          ) {
            if (transaction.type === "dividend") {
              transaction.commissionAndTaxes = effectiveTaxStatus === "filer" ? 15 : 30;
              transaction.isCommissionPercentage = true;
            } else if (transaction.type === "buy" || transaction.type === "sell") {
              if (settings) {
                transaction.commissionAndTaxes = settings.commissionRate;
                transaction.isCommissionPercentage = settings.isCommissionPercentage;
              } else {
                transaction.commissionAndTaxes = 0.15;
                transaction.isCommissionPercentage = true;
              }
            }
          }

          if (transaction.isCommissionPercentage === undefined) {
            transaction.isCommissionPercentage = false;
          }
        });

        setTransactionData(response?.data as TransactionSchemaType[]);
        setReviewVersion((currentVersion) => currentVersion + 1);
        handleNext();
      } else
        toast({
          type: "error",
          title: "Couldn't parse transactions data",
          description: response.message,
          duration: 5000,
        });
    } catch (error) {
      posthog.captureException(error);
      toast({
        type: "error",
        title: "Failed to parse transactions data. Something unexpected happened.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-none border-0 !bg-slate-900/90 !p-4">
      <AnimateChangeInHeight>
        <div className="relative w-full overflow-hidden">
          <div className={getStepClasses(1)}>
            <MultipleTransactionsInput
              onSubmit={handleDataSubmit}
              isLoading={isLoading || isLoadingSettings || isLoadingPortfolios}
              initialData={inputFormData}
              onDataChange={handleInputDataChange}
            />
          </div>

          <div className={getStepClasses(2)}>
            {transactionData && (
              <MultipleTransactionsReview
                key={reviewVersion}
                transactions={transactionData}
                onPrevious={handlePrevious}
                onClose={onCloseDialog}
              />
            )}
          </div>
        </div>
      </AnimateChangeInHeight>
    </Card>
  );
}

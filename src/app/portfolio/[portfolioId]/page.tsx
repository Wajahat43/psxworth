import { getPortfolios } from "@/actions/portfolio/portfolioActions";
import { getDetailedPortfolioPerformance } from "@/actions/portfolioPerformance/portfolioPerformance";
import { ErrorState } from "@/components/molecules/ErrorState";
import CommunityPromptHandler from "@/components/organisms/CommunityJoinPrompt/CommunityPromptHandler";
import { Button } from "@/components/ui/button";
import { Portfolio } from "@/db/schema";
import { Metadata } from "next";
import Link from "next/link";
import { PortfolioCookieSetter } from "./components/PortfolioCookieSetter";
import { PortfolioPageTabs } from "./components/PortfolioPageTabs";

export const dynamic = "force-dynamic"; // This page will always be re-rendered on the server

type MetadataProps = {
  params: Promise<{ portfolioId: string }>;
};

export async function generateMetadata({ params }: MetadataProps): Promise<Metadata> {
  const { portfolioId } = await params;
  return {
    alternates: {
      canonical: `/portfolio/${portfolioId}`,
    },
  };
}

type PortfolioPageProps = {
  params: Promise<{ portfolioId: string }>;
};

export default async function PortfolioPage({ params }: PortfolioPageProps) {
  const { portfolioId: portfolioIdString } = await params;
  const portfolioId = Number(portfolioIdString);
  const retryAction = (
    <Button asChild>
      <Link href="/portfolio">Back to portfolio</Link>
    </Button>
  );

  if (Number.isNaN(portfolioId)) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-4 text-center">
        <ErrorState
          title="Invalid portfolio"
          description="The provided portfolio ID is invalid."
          action={retryAction}
        />
        <PortfolioCookieSetter shouldDelete={true} />
      </div>
    );
  }

  const [performanceResponse, portfoliosListResponse] = await Promise.all([
    getDetailedPortfolioPerformance(portfolioId),
    getPortfolios(),
  ]);

  //First handle performance response
  if (!performanceResponse.success) {
    const errorMessage =
      performanceResponse.status >= 500
        ? "We're experiencing a temporary issue connecting to your portfolio. Please try again shortly."
        : performanceResponse.message;

    return (
      <div className="flex h-full flex-col items-center justify-center p-4 text-center">
        <ErrorState title="Something went wrong" description={errorMessage} action={retryAction} />
        <PortfolioCookieSetter shouldDelete={true} />
      </div>
    );
  }

  if (!portfoliosListResponse.success) {
    const errorMessage =
      portfoliosListResponse.status >= 500
        ? "We're experiencing a temporary issue connecting to your portfolio list. Please try again shortly."
        : portfoliosListResponse.message;

    return (
      <div className="flex h-full flex-col items-center justify-center p-4 text-center">
        <ErrorState title="Something went wrong" description={errorMessage} action={retryAction} />
        <PortfolioCookieSetter shouldDelete={true} />
      </div>
    );
  }

  const portfoliosList = portfoliosListResponse.data;
  if (!portfoliosList) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-4 text-center">
        <ErrorState title="Something went wrong" description="Unable to load portfolios" action={retryAction} />
        <PortfolioCookieSetter shouldDelete={true} />
      </div>
    );
  }
  const portfolioInfo = (portfoliosList as Portfolio[]).find((portfolio) => portfolio.id === portfolioId);

  if (!portfolioInfo) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-4 text-center">
        <PortfolioCookieSetter shouldDelete={true} />
        <ErrorState title="Something went wrong" description="Unable to load portfolio" action={retryAction} />
      </div>
    );
  }

  return (
    <main className="mx-auto flex h-full min-h-0 flex-col px-0 pt-0 pb-0">
      <PortfolioCookieSetter portfolioId={portfolioId} />
      <PortfolioPageTabs portfolioPerformance={performanceResponse.data} portfolioId={portfolioId} />
      <CommunityPromptHandler />
    </main>
  );
}

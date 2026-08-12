import { getPortfolios } from "@/actions/portfolio/portfolioActions";
import PortfoliosSidebar from "@/app/portfolio/[portfolioId]/components/PortfoliosSidebar";
import { Portfolio } from "@/db/schema";

export default async function SettingsLayout({ children }: { children: React.ReactNode }) {
  const response = await getPortfolios();
  const portfolioList = response?.success ? (response.data as Portfolio[]) : [];

  return <PortfoliosSidebar portfolioList={portfolioList}>{children}</PortfoliosSidebar>;
}

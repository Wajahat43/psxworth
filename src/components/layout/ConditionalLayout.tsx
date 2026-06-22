"use client";

import { usePathname } from "next/navigation";
import { Header } from "./Header";
import { Footer } from "./Footer/Footer";

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export const ConditionalLayout = ({ children }: ConditionalLayoutProps) => {
  const pathname = usePathname();
  const isPortfolioPage = pathname.startsWith("/portfolio") || pathname.startsWith("/settings");

  if (isPortfolioPage) {
    // Portfolio pages have their own sidebar layout, no header/footer needed
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
};

export default ConditionalLayout;

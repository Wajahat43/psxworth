import { Metadata } from "next";
import { getUserSettings } from "@/actions/userSettings/userSettingsActions";
import UserSettingsForm from "./components/UserSettingsForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Settings",
  description: "Configure your tax profile, default brokerage commissions, and automated financial workflows.",
  alternates: {
    canonical: "/settings",
  },
};

export default async function SettingsPage() {
  const settingsResponse = await getUserSettings();
  const settings = settingsResponse.success ? settingsResponse.data : null;

  return <UserSettingsForm initialSettings={settings ?? null} />;
}

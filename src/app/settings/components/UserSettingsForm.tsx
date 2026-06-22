"use client";

import { useState } from "react";
import { toast } from "@/components/molecules/Toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SidebarTrigger } from "@/components/animate-ui/components/radix/sidebar";
import { updateUserSettings } from "@/actions/userSettings/userSettingsActions";
import { UserSettings } from "@/db/schema";
import { Shield, Percent, Save, Loader2, Info } from "lucide-react";

interface UserSettingsFormProps {
  initialSettings: UserSettings | null;
}

export default function UserSettingsForm({ initialSettings }: UserSettingsFormProps) {
  const [taxStatus, setTaxStatus] = useState<"filer" | "non-filer">(initialSettings?.taxStatus ?? "filer");
  const [commissionRate, setCommissionRate] = useState<number>(initialSettings?.commissionRate ?? 0.15);
  const [isCommissionPercentage, setIsCommissionPercentage] = useState<boolean>(
    initialSettings?.isCommissionPercentage ?? true
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (commissionRate < 0) {
      toast({
        type: "error",
        title: "Invalid Commission Rate",
        description: "Commission rate cannot be negative.",
      });
      return;
    }
    if (isCommissionPercentage && commissionRate > 100) {
      toast({
        type: "error",
        title: "Invalid Commission Rate",
        description: "Percentage commission rate cannot exceed 100%.",
      });
      return;
    }
    setIsSaving(true);
    try {
      const response = await updateUserSettings({
        taxStatus,
        commissionRate: Number(commissionRate) || 0,
        isCommissionPercentage,
      });

      if (response.success) {
        toast({
          type: "success",
          title: "Settings updated successfully!",
        });
      } else {
        toast({
          type: "error",
          title: "Failed to update settings",
          description: response.message || undefined,
        });
      }
    } catch {
      toast({
        type: "error",
        title: "An unexpected error occurred while saving settings.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex h-full min-h-0 w-full flex-col rounded-none border border-sidebar-border/70 bg-sidebar/85 p-0 shadow-[0_10px_40px_rgba(0,0,0,0.25)] backdrop-blur-md">
      {/* Header bar */}
      <div className="flex shrink-0 flex-col items-stretch gap-2 border-b border-sidebar-border/80 bg-background/10 px-2 py-3 md:flex-row md:items-center md:justify-between md:px-4">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="size-8 border border-primary/50 bg-sidebar-accent/60 text-sidebar-foreground shadow-sm hover:bg-sidebar-accent" />
          <div className="h-6 w-px bg-sidebar-border/80" />
          <h1 className="text-lg font-bold text-gray-100 tracking-tight md:text-xl">
            User Settings
          </h1>
        </div>
      </div>

      {/* Form Content */}
      <div className="no-scrollbar flex-1 overflow-y-auto px-4 py-6 md:px-8 bg-slate-950/20">
        <div className="mx-auto max-w-2xl space-y-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white">Financial Automation Profiles</h2>
            <p className="text-sm text-slate-400 mt-1">
              Configure your default tax bracket and broker fee rules. These settings will automatically compute and auto-fill transaction entries.
            </p>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            {/* Tax Profile Card */}
            <Card className="border-slate-800 bg-slate-900/40 shadow-md backdrop-blur-sm">
              <div className="flex flex-col space-y-1.5 p-6 pb-3">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-slate-300" />
                  <h3 className="text-lg font-semibold text-slate-100 leading-none tracking-tight">Tax Profile</h3>
                </div>
                <p className="text-sm text-slate-400">
                  Configure your withholding tax status for automatically computing dividend tax rates.
                </p>
              </div>
              <div className="p-6 pt-0 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-lg bg-slate-950/40 p-4 border border-slate-800/40">
                  <div className="space-y-1">
                    <Label htmlFor="tax-status-toggle" className="text-sm font-semibold text-slate-200">
                      Tax Status: <span className="text-slate-100 uppercase font-bold">{taxStatus}</span>
                    </Label>
                    <p className="text-xs text-slate-400">
                      {taxStatus === "filer"
                        ? "Filer status applies a default 15% withholding tax rate on dividends."
                        : "Non-Filer status applies a default 30% withholding tax rate on dividends."}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-medium">Non-Filer</span>
                    <Switch
                      id="tax-status-toggle"
                      checked={taxStatus === "filer"}
                      onCheckedChange={(checked) => setTaxStatus(checked ? "filer" : "non-filer")}
                      className="data-[state=checked]:bg-primary"
                    />
                    <span className="text-xs text-slate-200 font-semibold">Filer</span>
                  </div>
                </div>

                <div className="flex items-start gap-2 bg-slate-950/40 border border-slate-800/60 rounded-md p-3 text-xs text-slate-400">
                  <Info className="h-4 w-4 mt-0.5 shrink-0 text-slate-400" />
                  <p>
                    These rates match the standard Pakistan Stock Exchange (PSX) withholding tax regulations. Taxes on dividends will automatically be calculated as 15% (for filers) or 30% (for non-filers) of gross dividend payout when not explicitly entered.
                  </p>
                </div>
              </div>
            </Card>

            {/* Brokerage Rules Card */}
            <Card className="border-slate-800 bg-slate-900/40 shadow-md backdrop-blur-sm">
              <div className="flex flex-col space-y-1.5 p-6 pb-3">
                <div className="flex items-center gap-2">
                  <Percent className="h-5 w-5 text-slate-300" />
                  <h3 className="text-lg font-semibold text-slate-100 leading-none tracking-tight">Brokerage Commission Rules</h3>
                </div>
                <p className="text-sm text-slate-400">
                  Set default commission rules applied to all your buy and sell transactions.
                </p>
              </div>
              <div className="p-6 pt-0 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="commission-rate" className="text-sm font-semibold text-slate-200">
                      Default Commission Rate
                    </Label>
                    <div className="relative">
                      <Input
                        id="commission-rate"
                        type="number"
                        step="any"
                        min="0"
                        max={isCommissionPercentage ? "100" : undefined}
                        placeholder="0.15"
                        value={commissionRate}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          setCommissionRate(isNaN(val) ? 0 : val);
                        }}
                        className="bg-slate-950/50 border-slate-800 text-slate-100 pr-8 focus:ring-primary focus:border-primary"
                      />
                      <div className="absolute right-3 top-2.5 text-xs text-slate-500">
                        {isCommissionPercentage ? "%" : "PKR"}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="commission-type" className="text-sm font-semibold text-slate-200">
                      Commission Type
                    </Label>
                    <Select
                      value={isCommissionPercentage ? "percentage" : "flat"}
                      onValueChange={(val) => setIsCommissionPercentage(val === "percentage")}
                    >
                      <SelectTrigger id="commission-type" className="bg-slate-950/50 border-slate-800 text-slate-100">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-800 text-slate-100">
                        <SelectItem value="percentage">Percentage (%)</SelectItem>
                        <SelectItem value="flat">Flat Fee (PKR)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-start gap-2 bg-slate-950/40 border border-slate-800/60 rounded-md p-3 text-xs text-slate-400">
                  <Info className="h-4 w-4 mt-0.5 shrink-0 text-slate-400" />
                  <p>
                    For percentage commission, the fee is calculated as a percentage of the total transaction volume (Price × Shares). For flat fee, the absolute rate is added to buys and deducted from sells.
                  </p>
                </div>
              </div>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                disabled={isSaving}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium px-6 py-2 rounded-md shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Settings
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

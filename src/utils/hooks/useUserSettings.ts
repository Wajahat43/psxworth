"use client";

import { getUserSettings, updateUserSettings } from "@/actions/userSettings/userSettingsActions";
import { UserSettings } from "@/db/schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/molecules/Toast";
import { useAuth } from "@clerk/nextjs";

export const useUserSettings = () => {
  const queryClient = useQueryClient();
  const { userId } = useAuth();

  const settings = useQuery({
    queryKey: ["userSettings", userId],
    queryFn: async () => {
      if (!userId) throw new Error("User not authenticated");
      const result = await getUserSettings();
      if (result.success && result.data) {
        return result.data as UserSettings;
      }
      throw new Error(result.message || "Failed to load user settings");
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: Omit<UserSettings, "userId" | "createdAt" | "updatedAt">) => {
      const response = await updateUserSettings(data);
      if (!response.success) {
        throw new Error(response.message || "Failed to update settings");
      }
      return response.data;
    },
    onSuccess: () => {
      toast({
        type: "success",
        title: "Settings updated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["userSettings", userId] });
      queryClient.invalidateQueries({ queryKey: ["portfolios", userId] });
    },
    onError: (error: Error) => {
      toast({
        type: "error",
        title: "Failed to update settings",
        description: error.message,
      });
    },
  });

  return {
    settings: settings.data ?? null,
    isLoading: settings.isLoading,
    isError: settings.isError,
    updateSettings: updateSettingsMutation,
  };
};

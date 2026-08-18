"use client";

import GradientButton from "@/components/ui/gradient-button";
import { Input } from "@/components/ui/input";
import SpinningLoader from "@/components/ui/spinning-loader";
import { Portfolio } from "@/db/schema";
import { usePortfolio } from "@/utils/hooks/usePortfolio";
import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "@radix-ui/react-label";
import { motion } from "motion/react";
import React from "react";
import { useForm } from "react-hook-form";
import { createPortfolioSchema, updatePortfolioSchema } from "./formSchema";

const portfolioEmojis = [
  "🚀",
  "🔥",
  "❤️",
  "👻",
  "⚡",
  "🔑",
  "⚒️",
  "🔶",
  "🔷",
  "💎",
  "💰",
  "🏦",
  "💵",
  "🔔",
  "🦄",
  "🦊",
  "🐶",
  "🐰",
  "🐯",
  "🐻",
  "🐮",
  "🍕",
  "🍔",
  "💊",
  "👑",
  "🌈",
  "🤖",
  "🌕",
];

const portfolioColors = [
  { id: "purple", hex: "#A855F7", tailwind: "bg-purple-100" },
  { id: "red", hex: "#EF4444", tailwind: "bg-red-100" },
  { id: "orange", hex: "#F97316", tailwind: "bg-orange-100" },
  { id: "amber", hex: "#F59E0B", tailwind: "bg-amber-100" },
  { id: "green", hex: "#10B981", tailwind: "bg-green-100" },
  { id: "teal", hex: "#14B8A6", tailwind: "bg-teal-100" },
  { id: "pink", hex: "#EC4899", tailwind: "bg-pink-100" },
  { id: "gray", hex: "#6B7280", tailwind: "bg-gray-100" },
  { id: "cyan", hex: "#06B6D4", tailwind: "bg-cyan-100" },
  { id: "lime", hex: "#84CC16", tailwind: "bg-lime-100" },
];

type CreatePortfolioFormProps = {
  onSuccess: (portfolio: any) => void;
  portfolio?: Portfolio;
};

export const CreatePortfolioForm = ({ onSuccess, portfolio }: CreatePortfolioFormProps) => {
  "use no memo";
  const { createPortfolioMutation, updatePortfolioMutation } = usePortfolio();
  const isPending = createPortfolioMutation.isPending || updatePortfolioMutation.isPending;

  type PortfolioFormValues = {
    title: string;
    emoji: string;
    backgroundColor: string;
    id?: number;
  };

  const isEditing = Boolean(portfolio);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<PortfolioFormValues>({
    mode: "onChange",
    resolver: zodResolver(isEditing ? updatePortfolioSchema : createPortfolioSchema),
    defaultValues: {
      title: portfolio?.title || "",
      emoji: portfolio?.emoji || portfolioEmojis[0],
      backgroundColor: portfolio?.backgroundColor || portfolioColors[0].hex,
      id: portfolio?.id,
    },
  });

  /* eslint-disable-next-line react-hooks/incompatible-library -- React Hook Form's watch() cannot be memoized safely; React Compiler skips this component */
  const selectedEmoji = watch("emoji");
  const selectedColorHex = watch("backgroundColor");

  const onSubmit = (data: PortfolioFormValues) => {
    if (portfolio) {
      updatePortfolioMutation.mutate({ ...portfolio, ...data, id: portfolio.id }, { onSuccess });
    } else {
      const { title, emoji, backgroundColor } = data;
      createPortfolioMutation.mutate({ title, emoji, backgroundColor } as any, { onSuccess });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-1 flex-col space-y-6 p-1 md:p-4" autoComplete="on">
      {/* Preview and Title in one row */}
      <div className="flex items-center space-x-4">
        <motion.div
          animate={{
            scale: [1, 1.05, 1],
            rotate: [0, 1.5, -1.5, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse",
          }}
          className="flex flex-shrink-0 items-center justify-center rounded-full shadow-md"
          style={{
            backgroundColor: selectedColorHex,
            width: "64px",
            height: "64px",
          }}
        >
          <span className="text-2xl">{selectedEmoji}</span>
        </motion.div>

        <div className="flex-grow">
          <Label htmlFor="portfolioTitle" className="mb-2 block font-medium text-gray-200">
            Portfolio Name
          </Label>
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Input
              id="portfolioTitle"
              {...register("title")}
              placeholder="My Investment Portfolio"
              className={`h-11 rounded-md border-white/10 bg-blue-950/30 text-base text-gray-100 shadow-sm backdrop-blur-sm placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 ${
                errors.title ? "border-destructive focus:border-destructive focus:ring-destructive/20" : ""
              }`}
            />
          </motion.div>
          {errors.title?.message && <p className="mt-1 text-sm text-destructive">{errors.title.message as string}</p>}

          {portfolio && <input type="hidden" {...register("id")} value={portfolio.id} />}
        </div>
      </div>

      {/* Color Selector */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <Label className="mb-2 block font-medium text-gray-200">Choose a Color</Label>
        <div className="mt-3 flex flex-wrap gap-3">
          {portfolioColors.map((color) => (
            <motion.button
              key={color.id}
              type="button"
              onClick={() => setValue("backgroundColor", color.hex, { shouldValidate: true })}
              className={`h-9 w-9 rounded-full transition-all hover:scale-110 ${
                selectedColorHex === color.hex
                  ? "scale-110 transform ring-2 ring-blue-400 ring-offset-1 ring-offset-blue-900/30"
                  : ""
              }`}
              style={{ backgroundColor: color.hex }}
              aria-label={`Select ${color.id} color`}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.95 }}
            />
          ))}
        </div>
      </motion.div>

      {/* Emoji Selector */}
      <motion.div
        className="flex min-h-0 flex-1 flex-col"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <Label className="mb-2 block font-medium text-gray-200">How are you feeling about this portfolio?</Label>
        <div className="overflow-y-auto rounded-lg border border-white/10 bg-blue-900/20 p-3 shadow-inner backdrop-blur-sm">
          <div className="grid grid-cols-7 gap-2 max-sm:grid-cols-4">
            {portfolioEmojis.map((emoji) => (
              <motion.button
                key={emoji}
                type="button"
                onClick={() => setValue("emoji", emoji, { shouldValidate: true })}
                className={`rounded p-1.5 text-xl transition-all hover:bg-blue-600/30 ${
                  selectedEmoji === emoji ? "bg-blue-500/30 ring-1 ring-blue-400/50" : ""
                }`}
                aria-label={`Select ${emoji} emoji`}
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                {emoji}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="pb-2"
      >
        <GradientButton
          type="submit"
          variant="cyanBlue"
          disabled={isPending || Object.keys(errors).length > 0}
          fullWidth
        >
          {isPending ? (
            <div className="flex items-center justify-center gap-2">
              <SpinningLoader size="xs" color="blue" />
              <motion.span>{portfolio ? "Updating Portfolio" : "Creating Portfolio"}</motion.span>
            </div>
          ) : (
            <span className="flex items-center justify-center">
              {portfolio ? "Update Portfolio" : "Create Portfolio"}
            </span>
          )}
        </GradientButton>
      </motion.div>
    </form>
  );
};

export default CreatePortfolioForm;

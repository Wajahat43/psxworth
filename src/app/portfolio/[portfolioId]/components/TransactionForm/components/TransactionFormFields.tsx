"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { FloatingLabelInput } from "@/components/ui/floating-label-input";
import { FloatingLabelTextarea } from "@/components/ui/floating-label-textarea";
import { FormControl, FormItem, useFormField } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { coerceToLocalDateDate, toLocalDate } from "@/types/localDate";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { ControllerRenderProps, FieldValues, Path, UseFormSetValue, UseFormWatch } from "react-hook-form";

// Ensures that the field names passed correspond to the actual fields in the data type TFieldValues
//This helps us in creating a generic type that we can use for Buy, sell, Dividend transaction forms.
type FieldName<TFieldValues extends FieldValues> = Path<TFieldValues>;

// Transaction Type Selector Component
export function TransactionTypeSelector<TFieldValues extends FieldValues>({
  setValue,
  watch,
  isEditing = false,
}: {
  setValue: UseFormSetValue<TFieldValues>;
  watch: UseFormWatch<TFieldValues>;
  isEditing?: boolean;
}) {
  "use no memo";
  const transactionType = watch("type" as Path<TFieldValues>) as "buy" | "sell" | "dividend";

  const getLayoutAnimationContainer = () => (
    <motion.div
      layoutId={"transaction-form-tabs-layout"}
      className="absolute inset-0 bg-gray-700 rounded-md shadow-sm border border-border"
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 35,
      }}
      style={{ willChange: "transform" }}
    />
  );

  return (
    <div className="bg-muted/50 rounded-lg mb-2 mt-2 border border-border/50">
      <div className="grid grid-cols-3 gap-1 relative">
        <button
          type="button"
          onClick={() => setValue("type" as Path<TFieldValues>, "buy" as any)}
          className={cn(
            "relative px-3 py-2 rounded-md text-sm font-medium transition-all duration-200",
            transactionType === "buy"
              ? "text-foreground hover:bg-transparent"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          )}
          disabled={isEditing}
        >
          {transactionType === "buy" && getLayoutAnimationContainer()}

          <span className="relative z-10 flex items-center justify-center gap-2">Buy</span>
        </button>
        <button
          type="button"
          onClick={() => setValue("type" as Path<TFieldValues>, "sell" as any)}
          className={cn(
            "relative px-3 py-2 rounded-md text-sm font-medium transition-all duration-200",
            transactionType === "sell"
              ? "text-foreground hover:bg-transparent"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          )}
          disabled={isEditing}
        >
          {transactionType === "sell" && getLayoutAnimationContainer()}

          <span className="relative z-10 flex items-center justify-center gap-2">Sell</span>
        </button>
        <button
          type="button"
          onClick={() => setValue("type" as Path<TFieldValues>, "dividend" as any)}
          className={cn(
            "relative px-3 py-2 rounded-md text-sm font-medium transition-all duration-200",
            transactionType === "dividend"
              ? "text-foreground hover:bg-transparent"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          )}
          disabled={isEditing}
        >
          {transactionType === "dividend" && getLayoutAnimationContainer()}

          <span className="relative z-10 flex items-center justify-center gap-2">Dividend</span>
        </button>
      </div>
    </div>
  );
}

// Date Input Component
export function DateInput<TFieldValues extends FieldValues>({
  field,
}: {
  field: ControllerRenderProps<TFieldValues, FieldName<TFieldValues>>;
}) {
  const { error } = useFormField();
  const [open, setOpen] = useState(false);
  return (
    <FormItem className="flex flex-col w-full">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <FormControl>
            <Button
              variant={"outline"}
              className={cn(
                "w-full pl-3 text-left font-normal border-slate-700 bg-slate-800/60 text-slate-200 hover:bg-blue-900/40 hover:text-slate-100 backdrop-blur-sm",
                !field.value && "text-slate-400",
                error && "border-destructive"
              )}
            >
              {field.value ? (
                format(coerceToLocalDateDate(field.value), "PPP")
              ) : (
                <span>{error ? `Transaction Date - ${error.message}` : "Transaction Date"}</span>
              )}
              <CalendarIcon strokeWidth={2.5} className="ml-auto h-5 w-5 text-primary" />
            </Button>
          </FormControl>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-0 bg-slate-900/90 border border-slate-700 shadow-md backdrop-blur-sm"
          align="start"
        >
          <Calendar
            mode="single"
            selected={field.value ? coerceToLocalDateDate(field.value) : undefined}
            onSelect={(value) => {
              field.onChange(value ? toLocalDate(value) : undefined);
              setOpen(false);
            }}
            className="rounded-md"
            showOutsideDays={false}
            disabled={{
              after: new Date(), // Disable future dates
            }}
          />
        </PopoverContent>
      </Popover>
    </FormItem>
  );
}

// Stock Selection Component
// Number of Shares Input Component
export function SharesCountInput<TFieldValues extends FieldValues>({
  field,
}: {
  field: ControllerRenderProps<TFieldValues, FieldName<TFieldValues>>;
}) {
  const { error } = useFormField();
  return (
    <FormItem>
      <FormControl>
        <FloatingLabelInput
          label={error ? `No. of Shares - ${error.message}` : "No. of Shares"}
          isError={!!error}
          variant="filled"
          className="text-slate-200 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          {...field}
          type="number"
          value={field.value ?? ""}
          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : e.target.value)}
        />
      </FormControl>
    </FormItem>
  );
}

// Price Per Share Input Component
export function PricePerShareInput<TFieldValues extends FieldValues>({
  field,
}: {
  field: ControllerRenderProps<TFieldValues, FieldName<TFieldValues>>;
}) {
  const { error } = useFormField();
  return (
    <FormItem>
      <FormControl>
        <FloatingLabelInput
          label={error ? `Price Per Share (PKR) - ${error.message}` : "Price Per Share (PKR)"}
          isError={!!error}
          variant="filled"
          className="text-slate-200 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          type="number"
          {...field}
          value={field.value ?? ""}
          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : e.target.value)}
        />
      </FormControl>
    </FormItem>
  );
}

// Dividend Per Share Input Component
export function DividendPerShareInput<TFieldValues extends FieldValues>({
  field,
}: {
  field: ControllerRenderProps<TFieldValues, FieldName<TFieldValues>>;
}) {
  const { error } = useFormField();
  return (
    <FormItem>
      <FormControl>
        <FloatingLabelInput
          label={error ? `Dividend Per Share (PKR) - ${error.message}` : "Dividend Per Share (PKR)"}
          isError={!!error}
          variant="filled"
          className="text-slate-200 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          type="number"
          {...field}
          value={field.value ?? ""}
          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : e.target.value)}
        />
      </FormControl>
    </FormItem>
  );
}

// Commission and Taxes Input Component with Integrated Toggle
export function CommissionInput<
  TFieldValues extends FieldValues,
  TCommissionFieldName extends FieldName<TFieldValues>, // Generic for commission field name
  TToggleFieldName extends FieldName<TFieldValues>, // Generic for toggle field name
>({
  field,
  toggleField,
  isPercentage,
}: {
  field: ControllerRenderProps<TFieldValues, TCommissionFieldName>;
  toggleField: ControllerRenderProps<TFieldValues, TToggleFieldName>;
  isPercentage: boolean; // Passed down from form state watcher
}) {
  const { error } = useFormField();
  const label = isPercentage ? "Commission/Taxes (%)" : "Commission/Taxes (PKR)";
  return (
    <FormItem>
      <div className="relative">
        <FormControl>
          <FloatingLabelInput
            label={error ? `${label} - ${error.message}` : label}
            isError={!!error}
            variant="filled"
            className="text-slate-200 pr-24 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            type="number"
            value={field.value ?? ""}
            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : e.target.value)}
            onBlur={field.onBlur}
            name={field.name}
          />
        </FormControl>
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center bg-slate-900/50 rounded-lg p-1 border border-slate-700/50">
          <button
            type="button"
            onClick={() => toggleField.onChange(false)}
            aria-label="Commission in PKR"
            className={cn(
              "transition-all duration-200 text-xs font-medium px-3 py-1 rounded-md",
              !isPercentage ? "bg-slate-700 text-slate-100 shadow-sm" : "text-slate-400 hover:text-slate-200"
            )}
          >
            PKR
          </button>
          <button
            type="button"
            aria-label="Commission in percentage"
            onClick={() => toggleField.onChange(true)}
            className={cn(
              "transition-all duration-200 text-xs font-medium px-3 py-1 rounded-md",
              isPercentage ? "bg-slate-700 text-slate-100 shadow-sm" : "text-slate-400 hover:text-slate-200"
            )}
          >
            %
          </button>
        </div>
      </div>
    </FormItem>
  );
}

// Note Input Component
export function NoteInput<TFieldValues extends FieldValues>({
  field,
}: {
  field: ControllerRenderProps<TFieldValues, FieldName<TFieldValues>>; // Use generic field type
}) {
  const { error } = useFormField();
  return (
    <FormItem>
      <FormControl>
        <FloatingLabelTextarea
          label={error ? `Note (Optional) - ${error.message}` : "Note (Optional)"}
          isError={!!error}
          variant="filled"
          className="text-slate-200 min-h-[80px]"
          rows={3}
          {...field}
          value={field.value ?? ""}
        />
      </FormControl>
    </FormItem>
  );
}

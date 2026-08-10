import { cn } from "@/lib/utils";
import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon } from "lucide-react";
import { AnimatePresence, motion, useIsPresent } from "motion/react";
import * as React from "react";
import { Button } from "./button";

type TableProps = React.HTMLAttributes<HTMLTableElement> & {
  wrapperClassName?: string;
};

const Table = React.forwardRef<HTMLTableElement, TableProps>(({ className, wrapperClassName, ...props }, ref) => (
  <div className={cn("relative w-full overflow-auto", wrapperClassName)}>
    <table ref={ref} className={cn("w-full caption-bottom text-sm", className)} {...props} />
  </div>
));
Table.displayName = "Table";

const TableHeader = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props} />
);
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <tbody ref={ref} className={cn("[&_tr:last-child]:border-0", className)} {...props} />
  )
);
TableBody.displayName = "TableBody";

const TableFooter = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <tfoot ref={ref} className={cn("border-t bg-muted/50 font-medium [&>tr]:last:border-b-0", className)} {...props} />
  )
);
TableFooter.displayName = "TableFooter";

const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
  ({ className, ...props }, ref) => (
    <tr ref={ref} className={cn("border-b hover:bg-muted/50 data-[state=selected]:bg-muted", className)} {...props} />
  )
);
TableRow.displayName = "TableRow";

const TableHead = React.forwardRef<HTMLTableCellElement, React.ThHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <th
      ref={ref}
      className={cn(
        "h-10 px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      )}
      {...props}
    />
  )
);
TableHead.displayName = "TableHead";

const TableCell = React.forwardRef<HTMLTableCellElement, React.TdHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <td
      ref={ref}
      className={cn("p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]", className)}
      {...props}
    />
  )
);
TableCell.displayName = "TableCell";

const TableCaption = React.forwardRef<HTMLTableCaptionElement, React.HTMLAttributes<HTMLTableCaptionElement>>(
  ({ className, ...props }, ref) => (
    <caption ref={ref} className={cn("mt-4 text-sm text-muted-foreground", className)} {...props} />
  )
);
TableCaption.displayName = "TableCaption";

const MotionButton = motion.create(Button);
const TableHeaderCell = ({ column, heading }: { column: any; heading: string }) => {
  "use no memo";
  const sortDirection = column.getIsSorted();
  const canSort = column.getCanSort();

  // Function to get the appropriate icon
  const getSortIcon = () => {
    switch (sortDirection) {
      case "asc":
        return <ArrowUpIcon className="h-4 w-4 text-gray-100" />;
      case "desc":
        return <ArrowDownIcon className="h-4 w-4 text-gray-100" />;
      default:
        return <ArrowUpDownIcon className="h-2 w-2 text-gray-100 opacity-0" />; //This is invisible, but for reserving space.
    }
  };
  const isAscending = sortDirection === "asc";

  if (!canSort) {
    return (
      <div className="pl-2 -ml-[0.7rem] relative h-10 flex items-center">
        <p className="text-gray-100 font-semibold text-left mr-2">{heading}</p>
      </div>
    );
  }

  return (
    <MotionButton
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      className="pl-2 -ml-[0.7rem] relative"
      layout={true}
      layoutId={column.id + heading}
    >
      <p className="text-gray-100 font-semibold text-left mr-2">{heading}</p>

      <AnimatePresence mode="wait">
        <motion.div
          key={sortDirection}
          initial={{ opacity: 0, y: isAscending ? 10 : -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10, transition: { duration: 0.1 } }}
          transition={{ duration: 0.2 }}
          className="absolute right-2"
        >
          {getSortIcon()}
        </motion.div>
      </AnimatePresence>
    </MotionButton>
  );
};

const MotionTableRow = motion.create(TableRow);
/**
 * This custom table row is created because we want to trigger the exit animation manually.
 */
const CustomTableRow = ({
  row,
  columns,
  transition,
  children,
}: {
  row: any;
  columns: any;
  transition: any;
  children?: React.ReactNode;
}) => {
  const isPresent = useIsPresent();
  return (
    <MotionTableRow
      key={`expanded-${row.id}`}
      layout={true}
      initial={{
        opacity: 0,
        height: 0,
      }}
      animate={{
        opacity: 1,
        height: "auto",
      }}
      exit={{
        opacity: 0,
        ...transition,
      }}
      transition={{ ...transition, opacity: { duration: 0.2 } }}
      style={{
        position: isPresent ? "relative" : "absolute",
        display: isPresent ? "table-row" : "flex",
        left: 0,
        right: 0,
      }}
    >
      <TableCell
        colSpan={columns.length}
        style={{
          position: isPresent ? "relative" : "absolute",
          left: 0,
          right: 0,
        }}
      >
        {children}
      </TableCell>
    </MotionTableRow>
  );
};

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
  TableHeaderCell,
  CustomTableRow,
  MotionTableRow,
};

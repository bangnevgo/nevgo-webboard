import {
  Table, TableHeader, TableBody, TableRow,
  TableHead, TableCell,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export function DataTable({ columns = [], data = [], className, emptyText = "Belum ada data", striped = false }) {
  return (
    <Table className={cn("text-[12px]", className)}>
      <TableHeader>
        <TableRow className="hover:bg-transparent border-border">
          {columns.map((col) => (
            <TableHead
              key={col.key}
              className={cn(
                "text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground h-8 px-3",
                col.width,
                col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : "text-left"
              )}
            >
              {col.label}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.length === 0 ? (
          <TableRow>
            <TableCell colSpan={columns.length} className="text-center text-[11px] text-muted-foreground py-8">
              {emptyText}
            </TableCell>
          </TableRow>
        ) : (
          data.map((row, idx) => (
            <TableRow
              key={row.id ?? idx}
              className={cn(
                "border-border/50 hover:bg-muted/40 transition-colors",
                striped && idx % 2 === 0 ? "bg-muted/20" : ""
              )}
            >
              {columns.map((col) => (
                <TableCell
                  key={col.key}
                  className={cn(
                    "text-[12px] py-2.5 px-3",
                    col.width,
                    col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : "text-left",
                    col.className
                  )}
                >
                  {col.render ? col.render(row[col.key], row, idx) : row[col.key]}
                </TableCell>
              ))}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}

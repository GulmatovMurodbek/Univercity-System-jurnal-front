import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
}

export function DataTable<T extends { id?: string }>({
  columns,
  data,
  onRowClick,
  emptyMessage = 'No data available',
}: DataTableProps<T>) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card variant="default" className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/50 hover:bg-secondary/50">
                {columns.map((column, index) => (
                  <TableHead
                    key={index}
                    className={cn(
                      'font-semibold text-foreground',
                      column.className
                    )}
                  >
                    {column.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center text-muted-foreground"
                  >
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              ) : (
                data.map((item, rowIndex) => (
                  <TableRow
                    key={item.id || rowIndex}
                    onClick={() => onRowClick?.(item)}
                    className={cn(
                      'transition-colors',
                      onRowClick && 'cursor-pointer hover:bg-secondary/30'
                    )}
                  >
                    {columns.map((column, colIndex) => (
                      <TableCell key={colIndex} className={column.className}>
                        {typeof column.accessor === 'function'
                          ? column.accessor(item)
                          : (item[column.accessor] as React.ReactNode)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </motion.div>
  );
}

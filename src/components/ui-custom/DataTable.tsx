import { useState } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  Row,
  PaginationState,
  OnChangeFn,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ChevronDown, LucideIcon } from 'lucide-react';
import EmptyState from './EmptyState';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  globalFilter?: string;
  setGlobalFilter?: (filter: string) => void;
  customGlobalFilterFn?: (row: Row<TData>, columnId: string, filterValue: any) => boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  EmptyIcon?: LucideIcon;
  emptyActionButton?: React.ReactNode;
  pagination?: PaginationState;
  onPaginationChange?: OnChangeFn<PaginationState>;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  globalFilter,
  setGlobalFilter,
  customGlobalFilterFn,
  emptyTitle = 'No hay datos para mostrar',
  emptyDescription = 'Ajusta tus filtros o añade nuevos registros para ver la información aquí.',
  EmptyIcon,
  emptyActionButton,
  pagination: externalPagination,
  onPaginationChange: externalOnPaginationChange,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const [internalPagination, setInternalPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const paginationState = externalPagination ?? internalPagination;
  const onPaginationStateChange = externalOnPaginationChange ?? setInternalPagination;

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter: globalFilter ?? '',
      pagination: paginationState,
    },
    onGlobalFilterChange: setGlobalFilter ? setGlobalFilter : undefined,
    globalFilterFn: customGlobalFilterFn || 'auto',
    onPaginationChange: onPaginationStateChange,
  });

  const totalRows = table.getFilteredRowModel().rows.length;
  const pageSize = table.getState().pagination.pageSize;
  const pageIndex = table.getState().pagination.pageIndex;
  const startIndex = totalRows > 0 ? pageIndex * pageSize + 1 : 0;
  const endIndex = Math.min(startIndex + pageSize - 1, totalRows);

  return (
    <div className="space-y-4">
      <div className="flex items-center py-4 justify-between">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium text-textSecondary">Resultados por página</p>
          <Select
            value={`${pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger className="h-9 w-[70px] rounded-lg border-border bg-background text-foreground hover:bg-muted/50 transition-all duration-300">
              <SelectValue placeholder={pageSize} />
            </SelectTrigger>
            <SelectContent className="bg-card border-border rounded-lg shadow-lg">
              {[10, 20, 50, 75].map((size) => (
                <SelectItem key={size} value={`${size}`} className="hover:bg-muted/50 cursor-pointer">
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="rounded-lg border-border bg-background text-foreground hover:bg-muted/50 transition-all duration-300">
              Columnas <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-card border-border rounded-lg shadow-lg">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize hover:bg-muted/50 cursor-pointer"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-xl border border-border overflow-hidden shadow-lg">
        <Table>
          <TableHeader className="bg-surface">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-border">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="text-textSecondary font-semibold">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className="border-border hover:bg-muted/50 transition-colors duration-200"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="p-0">
                  <EmptyState
                    title={emptyTitle}
                    description={emptyDescription}
                    Icon={EmptyIcon}
                    actionButton={emptyActionButton}
                  />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {totalRows > 0
            ? `${startIndex}-${endIndex} de ${totalRows} resultados.`
            : 'No hay resultados.'}
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="rounded-lg border-border bg-background text-foreground hover:bg-muted/50 transition-all duration-300"
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="rounded-lg border-border bg-background text-foreground hover:bg-muted/50 transition-all duration-300"
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  );
}

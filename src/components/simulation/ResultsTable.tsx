import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { TimeSeriesPoint } from '@/types/simulation';

interface ResultsTableProps {
  data: TimeSeriesPoint[] | null;
}

export function ResultsTable({ data }: ResultsTableProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-card border border-border p-6 flex items-center justify-center h-64">
        <p className="text-muted-foreground text-sm">Run a simulation to view detailed results</p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border">
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold text-sm">Simulation Results by Period</h3>
      </div>
      <div className="max-h-64 overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20 text-xs">Period</TableHead>
              <TableHead className="text-xs text-right">GDP</TableHead>
              <TableHead className="text-xs text-right">Employment %</TableHead>
              <TableHead className="text-xs text-right">Inflation %</TableHead>
              <TableHead className="text-xs text-right">Revenue (B$)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row.period}>
                <TableCell className="font-mono text-sm">{row.period}</TableCell>
                <TableCell className="font-mono text-sm text-right">{row.gdp.toFixed(2)}</TableCell>
                <TableCell className="font-mono text-sm text-right">{row.employment.toFixed(2)}%</TableCell>
                <TableCell className="font-mono text-sm text-right">{row.inflation.toFixed(2)}%</TableCell>
                <TableCell className="font-mono text-sm text-right">${row.revenue.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

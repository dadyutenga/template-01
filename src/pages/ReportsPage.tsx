import * as React from "react";
import { Download, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { ChartCard } from "@/components/shared/ChartCard";
import {
  AreaChartWrapper,
  BarChartWrapper,
  LineChartWrapper,
  PieChartWrapper,
} from "@/components/shared/Charts";
import { StatCard } from "@/components/shared/StatCard";
import { formatCurrency } from "@/lib/utils";

const MONTHLY_TRENDS = [
  { name: "Week 1", throughput: 420, efficiency: 88, latency: 45 },
  { name: "Week 2", throughput: 680, efficiency: 91, latency: 42 },
  { name: "Week 3", throughput: 890, efficiency: 94, latency: 38 },
  { name: "Week 4", throughput: 1120, efficiency: 96, latency: 35 },
];

const METRICS_BY_DEPARTMENT = [
  { name: "Engineering", requests: 14200, resolved: 13800 },
  { name: "Finance", requests: 8400, resolved: 8100 },
  { name: "Marketing", requests: 5600, resolved: 5300 },
  { name: "Operations", requests: 9200, resolved: 8900 },
  { name: "Customer Support", requests: 18600, resolved: 17900 },
];

const TRAFFIC_SOURCES = [
  { name: "Direct API", value: 45, color: "hsl(187 85% 43%)" },
  { name: "Web App UI", value: 30, color: "hsl(25 95% 65%)" },
  { name: "Automated Jobs", value: 15, color: "hsl(142 70% 55%)" },
  { name: "Webhooks", value: 10, color: "hsl(280 65% 60%)" },
];

export function ReportsPage() {
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleExportSummary = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Metric,Value,Period\n" +
      "Gross Volume,$142850,Current Month\n" +
      "Total Executions,56000,Current Month\n" +
      "System Uptime,99.98%,Current Month\n" +
      "Average Latency,38ms,Current Month\n";

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "system_report_summary.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header with Date Range Filter and Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Reports & Analytics
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Analyze trends, system performance metrics, and operational throughput.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <DateRangePicker />
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="h-10"
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </Button>
          <Button size="sm" onClick={handleExportSummary} className="h-10 gap-1.5">
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </Button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Gross Throughput"
          value={formatCurrency(189400)}
          change={12.4}
          period="vs. previous period"
        />
        <StatCard
          title="Executed Requests"
          value="56.4K"
          change={18.2}
          period="vs. previous period"
        />
        <StatCard
          title="System SLA"
          value="99.98%"
          change={0.02}
          period="Target: 99.9%"
        />
        <StatCard
          title="Median Response Time"
          value="38ms"
          change={-8.5}
          period="improved from 42ms"
        />
      </div>

      {/* Primary Chart Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard
          title="Operational Throughput & Efficiency"
          description="Weekly progression over selected period"
          className="lg:col-span-2"
        >
          <AreaChartWrapper
            data={MONTHLY_TRENDS}
            categories={[
              { key: "throughput", name: "Throughput (ops)", color: "hsl(187 85% 43%)" },
              { key: "latency", name: "Latency (ms)", color: "hsl(25 95% 65%)" },
            ]}
          />
        </ChartCard>

        <ChartCard
          title="Traffic Distribution by Source"
          description="Incoming origin breakdown"
        >
          <PieChartWrapper data={TRAFFIC_SOURCES} innerRadius={60} outerRadius={90} />
        </ChartCard>
      </div>

      {/* Secondary Chart Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Department Requests & Resolutions"
          description="Volume comparison per organizational unit"
        >
          <BarChartWrapper
            data={METRICS_BY_DEPARTMENT}
            bars={[
              { key: "requests", name: "Received", color: "hsl(187 85% 43%)" },
              { key: "resolved", name: "Resolved", color: "hsl(142 70% 55%)" },
            ]}
          />
        </ChartCard>

        <ChartCard
          title="Efficiency Score Over Time"
          description="Composite quality benchmark"
        >
          <LineChartWrapper
            data={MONTHLY_TRENDS}
            lines={[
              { key: "efficiency", name: "Efficiency Score (%)", color: "hsl(142 70% 55%)" },
            ]}
          />
        </ChartCard>
      </div>
    </div>
  );
}

export default ReportsPage;

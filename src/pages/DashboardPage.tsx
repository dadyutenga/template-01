import * as React from "react";
import { Link } from "react-router-dom";
import {
  DollarSign,
  Users,
  FileCheck,
  TrendingUp,
  Plus,
  Download,
  Activity,
  Layers,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/shared/StatCard";
import { ChartCard } from "@/components/shared/ChartCard";
import {
  AreaChartWrapper,
  BarChartWrapper,
  PieChartWrapper,
} from "@/components/shared/Charts";
import { ActivityFeed } from "@/components/shared/ActivityFeed";
import { useAuth } from "@/contexts/AuthContext";
import { formatDate, formatCurrency } from "@/lib/utils";
import type { ActivityItem } from "@/types/dashboard";

const SAMPLE_ACTIVITY: ActivityItem[] = [
  {
    id: "act-1",
    user: { name: "Alex Morgan" },
    action: "created",
    target: "Record #REC-1008 (Global CDN Configuration)",
    timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    type: "create",
  },
  {
    id: "act-2",
    user: { name: "Sarah Chen" },
    action: "updated",
    target: "Record #REC-1002 (Client Portal SSO)",
    timestamp: new Date(Date.now() - 1000 * 60 * 85).toISOString(),
    type: "update",
  },
  {
    id: "act-3",
    user: { name: "Elena Rossi" },
    action: "exported",
    target: "Q1 Financial Audit Summary CSV",
    timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    type: "export",
  },
  {
    id: "act-4",
    user: { name: "David Kim" },
    action: "completed",
    target: "Brand Asset Review milestone",
    timestamp: new Date(Date.now() - 1000 * 60 * 480).toISOString(),
    type: "update",
  },
];

const REVENUE_DATA = [
  { name: "Jan", revenue: 18500, expenses: 12400 },
  { name: "Feb", revenue: 22400, expenses: 13900 },
  { name: "Mar", revenue: 28900, expenses: 15200 },
  { name: "Apr", revenue: 26000, expenses: 14800 },
  { name: "May", revenue: 34500, expenses: 17100 },
  { name: "Jun", revenue: 41200, expenses: 19800 },
];

const CATEGORY_DATA = [
  { name: "Technology", count: 42 },
  { name: "Finance", count: 28 },
  { name: "Operations", count: 35 },
  { name: "Marketing", count: 19 },
  { name: "HR", count: 14 },
];

const STATUS_DISTRIBUTION = [
  { name: "Active", value: 58, color: "hsl(142 70% 45%)" },
  { name: "Pending", value: 24, color: "hsl(45 90% 50%)" },
  { name: "Draft", value: 12, color: "hsl(215 15% 60%)" },
  { name: "Archived", value: 6, color: "hsl(0 72% 51%)" },
];

export function DashboardPage() {
  const { user } = useAuth();
  const today = formatDate(new Date(), "EEEE, MMMM do, yyyy");

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 border border-primary/20">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Welcome back, {user?.name || "Admin"}! 👋
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Here is your daily operational summary for {today}.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to="/reports" className="gap-1.5">
              <Download className="h-4 w-4" />
              <span>Export Report</span>
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link to="/records" className="gap-1.5">
              <Plus className="h-4 w-4" />
              <span>New Record</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Value"
          value={formatCurrency(124850)}
          change={14.8}
          period="vs. last month"
          icon={DollarSign}
        />
        <StatCard
          title="Active Records"
          value="1,429"
          change={8.2}
          period="vs. last month"
          icon={FileCheck}
        />
        <StatCard
          title="Team Members"
          value="48"
          change={0}
          period="same as last month"
          icon={Users}
        />
        <StatCard
          title="Completion Rate"
          value="94.6%"
          change={3.4}
          period="vs. last month"
          icon={TrendingUp}
        />
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard
          title="Revenue & Expenses Trend"
          description="Monthly financial flow overview"
          className="lg:col-span-2"
          action={
            <Button variant="ghost" size="sm" asChild className="text-xs h-7 gap-1">
              <Link to="/reports">
                View detailed analytics <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          }
        >
          <AreaChartWrapper
            data={REVENUE_DATA}
            categories={[
              { key: "revenue", name: "Revenue ($)", color: "hsl(187 85% 43%)" },
              { key: "expenses", name: "Expenses ($)", color: "hsl(25 95% 65%)" },
            ]}
          />
        </ChartCard>

        <ChartCard
          title="Status Breakdown"
          description="Current record distribution"
        >
          <PieChartWrapper data={STATUS_DISTRIBUTION} innerRadius={65} outerRadius={95} />
        </ChartCard>
      </div>

      {/* Secondary Row: Category Breakdown and Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard
          title="Volume by Category"
          description="Distribution of operational records"
          className="lg:col-span-2"
        >
          <BarChartWrapper
            data={CATEGORY_DATA}
            bars={[{ key: "count", name: "Records", color: "hsl(187 85% 43%)" }]}
          />
        </ChartCard>

        <ChartCard
          title="Recent Activity"
          description="Live chronological system audit feed"
          action={
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Activity className="h-3.5 w-3.5 text-emerald-500 animate-pulse" />
              <span>Live</span>
            </div>
          }
        >
          <div className="pt-2">
            <ActivityFeed items={SAMPLE_ACTIVITY} />
          </div>
        </ChartCard>
      </div>

      {/* Quick Navigation Footer Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        <div className="rounded-xl border bg-card p-4 transition-all hover:border-primary/50">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground">CRUD Data Table</h4>
              <p className="text-xs text-muted-foreground">
                Sort, filter, search, paginate, export
              </p>
            </div>
          </div>
          <Button variant="link" size="sm" asChild className="p-0 h-auto mt-3 text-xs">
            <Link to="/records">Open Records &rarr;</Link>
          </Button>
        </div>

        <div className="rounded-xl border bg-card p-4 transition-all hover:border-primary/50">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-secondary/10 p-2.5 text-secondary">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground">Reports & Analytics</h4>
              <p className="text-xs text-muted-foreground">
                Date range filtering and chart exports
              </p>
            </div>
          </div>
          <Button variant="link" size="sm" asChild className="p-0 h-auto mt-3 text-xs">
            <Link to="/reports">View Reports &rarr;</Link>
          </Button>
        </div>

        <div className="rounded-xl border bg-card p-4 transition-all hover:border-primary/50">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-500/10 p-2.5 text-emerald-500">
              <Plus className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground">Developer Guide</h4>
              <p className="text-xs text-muted-foreground">
                How to add new pages in minutes
              </p>
            </div>
          </div>
          <Button variant="link" size="sm" asChild className="p-0 h-auto mt-3 text-xs">
            <Link to="/example">Read Guide &rarr;</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;

"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";
import {
  Loader2,
  TrendingUp,
  BarChart3,
  PieChart as PieChartIcon,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Button } from "@/components/ui/Button";
export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<{
    trends: { date: string; StockIn: number; StockOut: number }[];
    topSelling: { name: string; sold: number; revenue: number }[];
    categorySales: { name: string; value: number }[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const COLORS = [
    "#10b981",
    "#3b82f6",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#ec4899",
    "#14b8a6",
    "#f97316",
  ];

  useEffect(() => {
    fetch("/api/analytics")
      .then((res) => res.json())
      .then((data) => {
        setAnalytics(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch analytics:", err);
        setLoading(false);
      });
  }, []);

  const formatRupee = (value: number) => `₹${value.toLocaleString("en-IN")}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Analytics
          </h1>
          <p className="text-muted-foreground mt-1">
            Track your stock movement and top performing items.
          </p>
        </div>
      </div>
      <Button
        onClick={async () => {
          const res = await fetch("/api/dynamic-pricing");
          const data = await res.json();
          alert(data.message);
        }}
      >
        Generate Dynamic Pricing
      </Button>

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : analytics ? (
        <div className="grid gap-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="rounded-2xl border-none shadow-sm ring-1 ring-border/50">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <BarChart3 className="mr-2 h-5 w-5 text-indigo-500" />
                  Stock In vs Stock Out (Last 30 Days)
                </CardTitle>
                <CardDescription>
                  Daily quantity of items added vs sold.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  {analytics.trends.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                      No recent transactions.
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analytics.trends}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="#e5e7eb"
                        />
                        <XAxis
                          dataKey="date"
                          tickLine={false}
                          axisLine={false}
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis
                          tickLine={false}
                          axisLine={false}
                          tick={{ fontSize: 12 }}
                        />
                        <Tooltip cursor={{ fill: "transparent" }} />
                        <Legend />
                        <Bar
                          dataKey="StockIn"
                          name="Stock In"
                          fill="#10b981"
                          radius={[4, 4, 0, 0]}
                        />
                        <Bar
                          dataKey="StockOut"
                          name="Stock Out (Sales)"
                          fill="#3b82f6"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-none shadow-sm ring-1 ring-border/50">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <TrendingUp className="mr-2 h-5 w-5 text-emerald-500" />
                  Top Selling Products
                </CardTitle>
                <CardDescription>Highest volume products sold.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.topSelling.length === 0 ? (
                    <div className="flex h-[200px] items-center justify-center text-muted-foreground">
                      No sales recorded yet.
                    </div>
                  ) : (
                    analytics.topSelling.map((product, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-4 rounded-xl border group hover:shadow-sm transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div className="bg-primary/10 text-primary h-10 w-10 flex items-center justify-center rounded-lg font-bold">
                            #{idx + 1}
                          </div>
                          <div>
                            <p className="font-semibold">{product.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {product.sold} units sold
                            </p>
                          </div>
                        </div>
                        <div className="font-bold text-emerald-600">
                          ₹{product.revenue.toLocaleString("en-IN")}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* New Category Analytics Card */}
          {analytics.categorySales && analytics.categorySales.length > 0 && (
            <Card className="rounded-2xl border-none shadow-sm ring-1 ring-border/50">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <PieChartIcon className="mr-2 h-5 w-5 text-orange-500" />
                  Revenue Distribution by Category
                </CardTitle>
                <CardDescription>
                  See which categories generate the most income.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[350px] w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics.categorySales}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({
                          name,
                          percent,
                        }: {
                          name?: string;
                          percent?: number;
                        }) =>
                          `${name || "Unknown"} ${((percent || 0) * 100).toFixed(0)}%`
                        }
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {analytics.categorySales.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number | undefined) =>
                          formatRupee(value || 0)
                        }
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <div className="p-8 text-center text-red-500 border rounded-lg">
          Failed to load analytics data
        </div>
      )}
    </div>
  );
}

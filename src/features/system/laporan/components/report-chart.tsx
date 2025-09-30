"use client"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

interface ReportChartProps {
  type: "line" | "area" | "bar" | "pie"
  data?: any[]
  className?: string
}

const defaultLineData = [
  { name: "Jan", value: 400000000, target: 350000000 },
  { name: "Feb", value: 300000000, target: 400000000 },
  { name: "Mar", value: 450000000, target: 420000000 },
  { name: "Apr", value: 280000000, target: 380000000 },
  { name: "Mei", value: 390000000, target: 400000000 },
  { name: "Jun", value: 520000000, target: 450000000 },
  { name: "Jul", value: 480000000, target: 480000000 },
  { name: "Agu", value: 520000000, target: 500000000 },
  { name: "Sep", value: 450000000, target: 480000000 },
  { name: "Okt", value: 480000000, target: 500000000 },
  { name: "Nov", value: 520000000, target: 520000000 },
  { name: "Des", value: 550000000, target: 540000000 },
]

const defaultBarData = [
  { name: "Pendapatan", value: 452318900, color: "#3b82f6" },
  { name: "Biaya Operasional", value: 280000000, color: "#ef4444" },
  { name: "Laba Kotor", value: 172318900, color: "#10b981" },
  { name: "Pajak", value: 34463780, color: "#f59e0b" },
  { name: "Laba Bersih", value: 137855120, color: "#8b5cf6" },
]

const defaultPieData = [
  { name: "Produk A", value: 35, color: "#3b82f6" },
  { name: "Produk B", value: 25, color: "#10b981" },
  { name: "Produk C", value: 20, color: "#f59e0b" },
  { name: "Produk D", value: 15, color: "#ef4444" },
  { name: "Lainnya", value: 5, color: "#6b7280" },
]

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export function ReportChart({ type, data, className }: ReportChartProps) {
  const renderChart = () => {
    switch (type) {
      case "line":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data || defaultLineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={formatCurrency} />
              <Tooltip
                formatter={(value: number) => [formatCurrency(value), ""]}
                labelStyle={{ color: "hsl(var(--foreground))" }}
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                }}
              />
              <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} name="Aktual" />
              <Line
                type="monotone"
                dataKey="target"
                stroke="#10b981"
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Target"
              />
            </LineChart>
          </ResponsiveContainer>
        )

      case "area":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data || defaultLineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={formatCurrency} />
              <Tooltip
                formatter={(value: number) => [formatCurrency(value), ""]}
                labelStyle={{ color: "hsl(var(--foreground))" }}
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                }}
              />
              <Area type="monotone" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} name="Arus Kas" />
            </AreaChart>
          </ResponsiveContainer>
        )

      case "bar":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data || defaultBarData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tickFormatter={formatCurrency} />
              <YAxis dataKey="name" type="category" width={120} />
              <Tooltip
                formatter={(value: number) => [formatCurrency(value), ""]}
                labelStyle={{ color: "hsl(var(--foreground))" }}
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                }}
              />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        )

      case "pie":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data || defaultPieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {(data || defaultPieData).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [`${value}%`, "Persentase"]}
                labelStyle={{ color: "hsl(var(--foreground))" }}
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        )

      default:
        return <div>Chart type not supported</div>
    }
  }

  return <div className={className}>{renderChart()}</div>
}

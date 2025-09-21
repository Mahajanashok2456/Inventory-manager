import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  LinearProgress,
  Chip,
  Button,
  Skeleton,
} from "@mui/material";
import {
  TrendingUp,
  Inventory,
  ShoppingCart,
  CurrencyRupee,
  Add as AddIcon,
  Refresh as RefreshIcon,
  ArrowUpward,
  ArrowDownward,
  ArrowForward as ArrowForwardIcon,
} from "@mui/icons-material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  Area,
  AreaChart,
  ReferenceLine,
  Cell,
} from "recharts";
import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000/api";

const StatCard = ({
  title,
  value,
  icon,
  color = "primary.main",
  trend,
  trendValue,
  loading = false,
  onClick,
  clickable = false,
}) => (
  <Card
    onClick={clickable ? onClick : undefined}
    sx={{
      height: "100%",
      position: "relative",
      overflow: "hidden",
      cursor: clickable ? "pointer" : "default",
      transition: "all 0.2s ease-in-out",
      "&::before": {
        content: '""',
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: "4px",
        background: `linear-gradient(90deg, ${color} 0%, ${color}dd 100%)`,
      },
      ...(clickable && {
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
          "&::before": {
            height: "6px",
          },
        },
      }),
    }}
  >
    <CardContent sx={{ p: 3 }}>
      {loading ? (
        <Box>
          <Skeleton variant="text" width="60%" height={24} />
          <Skeleton variant="text" width="40%" height={40} />
          <Skeleton variant="circular" width={48} height={48} />
        </Box>
      ) : (
        <>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 2,
            }}
          >
            <Box sx={{ flexGrow: 1 }}>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
              >
                <Typography
                  color="text.secondary"
                  variant="body2"
                  sx={{
                    fontWeight: 500,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  {title}
                </Typography>
                <Chip
                  label="Live"
                  size="small"
                  color="success"
                  variant="outlined"
                  sx={{ fontSize: "0.6rem", height: "16px" }}
                />
              </Box>
              <Typography
                variant="h3"
                component="h2"
                sx={{ fontWeight: 700, mb: 1 }}
              >
                {value}
              </Typography>
              {trend && trend !== "neutral" && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  {trend === "up" ? (
                    <ArrowUpward sx={{ color: "success.main", fontSize: 16 }} />
                  ) : (
                    <ArrowDownward sx={{ color: "error.main", fontSize: 16 }} />
                  )}
                  <Typography
                    variant="caption"
                    sx={{
                      color: trend === "up" ? "success.main" : "error.main",
                      fontWeight: 600,
                    }}
                  >
                    {trendValue}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    vs last month
                  </Typography>
                </Box>
              )}
              {(!trend || trend === "neutral") && (
                <Typography
                  variant="caption"
                  sx={{
                    color: "text.secondary",
                    fontWeight: 500,
                  }}
                >
                  No change
                </Typography>
              )}
            </Box>
            <Box sx={{ position: "relative" }}>
              <Box
                sx={{
                  color: color,
                  opacity: 0.8,
                  "& .MuiSvgIcon-root": {
                    fontSize: 48,
                    filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
                  },
                }}
              >
                {icon}
              </Box>
              {clickable && (
                <ArrowForwardIcon
                  sx={{
                    position: "absolute",
                    bottom: -8,
                    right: -8,
                    backgroundColor: "background.paper",
                    borderRadius: "50%",
                    padding: 0.5,
                    fontSize: 20,
                    color: "text.secondary",
                    boxShadow: 1,
                  }}
                />
              )}
            </Box>
          </Box>
          <LinearProgress
            variant="determinate"
            value={75}
            sx={{
              height: 4,
              borderRadius: 2,
              backgroundColor: "action.hover",
              "& .MuiLinearProgress-bar": {
                background: `linear-gradient(90deg, ${color} 0%, ${color}dd 100%)`,
                borderRadius: 2,
              },
            }}
          />
        </>
      )}
    </CardContent>
  </Card>
);

export default function Dashboard() {
  const [inventorySummary, setInventorySummary] = useState({});
  const [salesSummary, setSalesSummary] = useState({});
  const [todayOrders, setTodayOrders] = useState({});
  const [loading, setLoading] = useState(true);
  const [trendUpdateTrigger, setTrendUpdateTrigger] = useState(0);
  const navigate = useNavigate();

  // Function to get bar color based on profit value
  const getBarColor = (profit) => {
    const inventoryValue = inventorySummary.total_inventory_value || 1;
    const profitPercentage = (profit / inventoryValue) * 100;

    if (profitPercentage >= 0.5) return "#059669"; // Excellent profit - Green
    if (profitPercentage >= 0.3) return "#0ea5e9"; // Good profit - Blue
    if (profitPercentage >= 0.1) return "#f59e0b"; // Moderate profit - Orange
    if (profit > 0) return "#84cc16"; // Low profit - Light green
    return "#ef4444"; // Loss - Red
  };

  // Function to calculate Y-axis domain based on inventory value
  const calculateYAxisDomain = useMemo(() => {
    const inventoryValue = inventorySummary.total_inventory_value || 0;
    const dailySales = salesSummary?.daily_sales || [];
    const dailyProfits = salesSummary?.daily_profits || [];

    // Get the maximum values from actual data
    const maxRevenue = Math.max(...dailySales.map((d) => d.revenue || 0), 0);
    const maxProfit = Math.max(...dailyProfits.map((d) => d.profit || 0), 0);
    const maxDataValue = Math.max(maxRevenue, maxProfit);

    // Calculate meaningful scale based on inventory value context
    // Use 5% of inventory value as reference, but ensure it shows actual data well
    const inventoryBasedScale = inventoryValue * 0.05;
    const dataBasedScale = maxDataValue * 1.2; // 20% padding above max data

    // Use the larger of the two, but with minimum of ₹1000
    const maxScale = Math.max(inventoryBasedScale, dataBasedScale, 1000);
    const roundedMax = Math.ceil(maxScale / 1000) * 1000; // Round to nearest 1000

    return [0, roundedMax];
  }, [inventorySummary.total_inventory_value, salesSummary]);

  // Historical data tracking for trend calculations
  const [historicalData, setHistoricalData] = useState({
    totalProducts: [],
    totalInventory: [],
    inventorySold: [],
    lowStockCount: [],
    todayOrders: [],
    todayRevenue: [],
    inventoryValue: [],
  });

  // Track previous values for comparison
  const [previousData, setPreviousData] = useState({
    totalProducts: 0,
    totalInventory: 0,
    inventorySold: 0,
    lowStockCount: 0,
    todayOrders: 0,
    todayRevenue: 0,
    inventoryValue: 0,
  });

  // Data-driven percentage calculations
  const calculateDataDrivenTrends = useMemo(() => {
    const currentData = {
      totalProducts: inventorySummary.total_products || 0,
      totalInventory: inventorySummary.total_quantity || 0,
      inventorySold: inventorySummary.total_sold_quantity || 0,
      lowStockCount: inventorySummary.low_stock_count || 0,
      todayOrders: salesSummary?.summary?.total_orders || 0,
      todayRevenue: todayOrders.total_revenue || 0,
      inventoryValue: inventorySummary.total_inventory_value || 0,
    };

    // Calculate percentage changes based on historical data
    const calculatePercentageChange = (current, previous, history) => {
      if (!previous || previous === 0) {
        return { trend: "neutral", value: 0 };
      }

      const change = ((current - previous) / previous) * 100;
      const trend = change > 0 ? "up" : change < 0 ? "down" : "neutral";

      // Calculate realistic percentage based on magnitude of change
      let percentageValue = Math.abs(change);

      // Cap the percentage display at reasonable values
      if (percentageValue > 100) percentageValue = 100;
      if (percentageValue < 0.1) percentageValue = 0;

      return { trend, value: Math.round(percentageValue) };
    };

    // Get previous values from historical data
    const prevProducts = previousData.totalProducts;
    const prevInventory = previousData.totalInventory;
    const prevSold = previousData.inventorySold;
    const prevLowStock = previousData.lowStockCount;
    const prevOrders = previousData.todayOrders;
    const prevRevenue = previousData.todayRevenue;

    // Calculate trends based on real data changes
    const trends = {
      totalProducts: calculatePercentageChange(
        currentData.totalProducts,
        prevProducts,
        historicalData.totalProducts
      ),
      totalInventory: calculatePercentageChange(
        currentData.totalInventory,
        prevInventory,
        historicalData.totalInventory
      ),
      inventorySold: calculatePercentageChange(
        currentData.inventorySold,
        prevSold,
        historicalData.inventorySold
      ),
      lowStock: calculatePercentageChange(
        currentData.lowStockCount,
        prevLowStock,
        historicalData.lowStockCount
      ),
      todayOrders: calculatePercentageChange(
        currentData.todayOrders,
        prevOrders,
        historicalData.todayOrders
      ),
      todayRevenue: calculatePercentageChange(
        currentData.todayRevenue,
        prevRevenue,
        historicalData.todayRevenue
      ),
    };

    return trends;
  }, [
    inventorySummary,
    salesSummary,
    todayOrders,
    previousData,
    historicalData,
  ]);

  // Update trends periodically to simulate real-time changes
  useEffect(() => {
    const interval = setInterval(() => {
      // Force re-render to update random percentages
      setTrendUpdateTrigger((prev) => prev + 1);
    }, 12000); // Update every 12 seconds

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Update historical data tracking
  const updateHistoricalData = (newData) => {
    setHistoricalData((prev) => ({
      totalProducts: [
        ...prev.totalProducts.slice(-9),
        newData.totalProducts,
      ].slice(-10),
      totalInventory: [
        ...prev.totalInventory.slice(-9),
        newData.totalInventory,
      ].slice(-10),
      inventorySold: [
        ...prev.inventorySold.slice(-9),
        newData.inventorySold,
      ].slice(-10),
      lowStockCount: [
        ...prev.lowStockCount.slice(-9),
        newData.lowStockCount,
      ].slice(-10),
      todayOrders: [...prev.todayOrders.slice(-9), newData.todayOrders].slice(
        -10
      ),
      todayRevenue: [
        ...prev.todayRevenue.slice(-9),
        newData.todayRevenue,
      ].slice(-10),
      inventoryValue: [
        ...prev.inventoryValue.slice(-9),
        newData.inventoryValue,
      ].slice(-10),
    }));
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [inventoryResponse, salesResponse, todayResponse] =
        await Promise.all([
          axios.get(`${API_BASE_URL}/inventory/summary/`),
          axios.get(`${API_BASE_URL}/orders/sales-summary/`),
          axios.get(`${API_BASE_URL}/orders/today-orders/`),
        ]);

      const newInventoryData = inventoryResponse.data;
      const newTodayData = todayResponse.data;
      const newSalesData = salesResponse.data;

      // Update previous data for comparison
      setPreviousData({
        totalProducts: inventorySummary.total_products || 0,
        totalInventory: inventorySummary.total_quantity || 0,
        inventorySold: inventorySummary.total_sold_quantity || 0,
        lowStockCount: inventorySummary.low_stock_count || 0,
        todayOrders: salesSummary?.summary?.total_orders || 0,
        todayRevenue: todayOrders.total_revenue || 0,
        inventoryValue: inventorySummary.total_inventory_value || 0,
      });

      // Update historical data
      updateHistoricalData({
        totalProducts: newInventoryData.total_products || 0,
        totalInventory: newInventoryData.total_quantity || 0,
        inventorySold: newInventoryData.total_sold_quantity || 0,
        lowStockCount: newInventoryData.low_stock_count || 0,
        todayOrders: newSalesData?.summary?.total_orders || 0,
        todayRevenue: newTodayData.total_revenue || 0,
        inventoryValue: newInventoryData.total_inventory_value || 0,
      });

      setInventorySummary(newInventoryData);
      setSalesSummary(salesResponse.data);
      setTodayOrders(newTodayData);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Loading Dashboard...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Box>
            <Typography
              variant="h3"
              component="h1"
              gutterBottom
              sx={{ fontWeight: 700 }}
            >
              Dashboard
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 0 }}>
              Welcome back! Here's what's happening with your store today.
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchDashboardData}
              sx={{ borderRadius: 2 }}
            >
              Refresh
            </Button>
          </Box>
        </Box>

        {/* Quick Stats Bar */}
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <Chip
            label={`${inventorySummary.total_products || 0} Products`}
            color="primary"
            variant="outlined"
            sx={{ fontWeight: 600 }}
          />
          <Chip
            label={`${todayOrders.total_orders || 0} Orders Today`}
            color="success"
            variant="outlined"
            sx={{ fontWeight: 600 }}
          />
          <Chip
            label={`₹${parseFloat(todayOrders.total_revenue || 0).toFixed(
              0
            )} Revenue`}
            color="warning"
            variant="outlined"
            sx={{ fontWeight: 600 }}
          />
          {inventorySummary.low_stock_count > 0 && (
            <Chip
              label={`${inventorySummary.low_stock_count} Low Stock`}
              color="error"
              variant="outlined"
              sx={{ fontWeight: 600 }}
            />
          )}
        </Box>
      </Box>

      {/* Key Metrics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Total Inventory"
            value={inventorySummary.total_quantity || 0}
            icon={<Inventory />}
            color="#4f46e5"
            trend={calculateDataDrivenTrends.totalInventory?.trend}
            trendValue={calculateDataDrivenTrends.totalInventory?.value}
            loading={loading}
            clickable={true}
            onClick={() => navigate("/inventory")}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Inventory Sold"
            value={inventorySummary.total_sold_quantity || 0}
            icon={<TrendingUp />}
            color="#059669"
            trend={calculateDataDrivenTrends.inventorySold?.trend}
            trendValue={calculateDataDrivenTrends.inventorySold?.value}
            loading={loading}
            clickable={true}
            onClick={() => navigate("/analytics")}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Low Stock Items"
            value={inventorySummary.low_stock_count || 0}
            icon={<TrendingUp />}
            color="#dc2626"
            trend={calculateDataDrivenTrends.lowStock.trend}
            trendValue={calculateDataDrivenTrends.lowStock.value}
            loading={loading}
            clickable={true}
            onClick={() => navigate("/inventory")}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Total Orders"
            value={salesSummary?.summary?.total_orders || 0}
            icon={<ShoppingCart />}
            color="#059669"
            trend={calculateDataDrivenTrends.todayOrders.trend}
            trendValue={calculateDataDrivenTrends.todayOrders.value}
            loading={loading}
            clickable={true}
            onClick={() => navigate("/orders")}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Today's Revenue"
            value={`₹${parseFloat(todayOrders.total_revenue || 0).toFixed(0)}`}
            icon={<CurrencyRupee />}
            color="#7c3aed"
            trend={calculateDataDrivenTrends.todayRevenue.trend}
            trendValue={calculateDataDrivenTrends.todayRevenue.value}
            loading={loading}
            clickable={true}
            onClick={() => navigate("/analytics")}
          />
        </Grid>
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Card sx={{ height: "100%" }}>
            <CardContent sx={{ p: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 3,
                }}
              >
                <Box>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{
                      fontWeight: 600,
                      background:
                        "linear-gradient(45deg, #06b6d4, #3b82f6, #6366f1)",
                      backgroundClip: "text",
                      color: "transparent",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    Sales Trend (Last 30 Days)
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Daily revenue scaled to inventory value context
                  </Typography>
                </Box>
                <Chip
                  label="Live Data"
                  color="success"
                  size="small"
                  sx={{ fontWeight: 600 }}
                />
              </Box>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={salesSummary.daily_sales || []}>
                  <defs>
                    <linearGradient
                      id="colorRevenue"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                      <stop
                        offset="50%"
                        stopColor="#3b82f6"
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor="#6366f1"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                    <linearGradient
                      id="lineGradient"
                      x1="0"
                      y1="0"
                      x2="1"
                      y2="0"
                    >
                      <stop offset="0%" stopColor="#06b6d4" />
                      <stop offset="50%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#6366f1" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e2e8f0"
                    strokeOpacity={0.3}
                  />
                  <XAxis
                    dataKey="date"
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={12}
                    tickFormatter={(value) => `₹${value}`}
                    domain={calculateYAxisDomain}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #e2e8f0",
                      borderRadius: 8,
                      boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                    }}
                    formatter={(value) => {
                      const inventoryValue =
                        inventorySummary.total_inventory_value || 1;
                      const percentage = (
                        (value / inventoryValue) *
                        100
                      ).toFixed(3);
                      return [
                        `₹${parseFloat(value).toFixed(
                          2
                        )} (${percentage}% of inventory)`,
                        "Revenue",
                      ];
                    }}
                    labelStyle={{ color: "#374151", fontWeight: 600 }}
                  />
                  <ReferenceLine
                    y={inventorySummary.total_inventory_value * 0.01}
                    stroke="#94a3b8"
                    strokeDasharray="5 5"
                    label={{
                      value: "1% of Inventory Value",
                      position: "insideTopRight",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="url(#lineGradient)"
                    strokeWidth={4}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                    name="Daily Revenue"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} lg={4}>
          <Card sx={{ height: "100%" }}>
            <CardContent sx={{ p: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 3,
                }}
              >
                <Box>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ fontWeight: 600 }}
                  >
                    Inventory Value
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total worth of stock
                  </Typography>
                </Box>
                <Inventory sx={{ color: "success.main", fontSize: 32 }} />
              </Box>
              <Typography
                variant="h3"
                color="success.main"
                sx={{ fontWeight: 700, mb: 1 }}
              >
                ₹
                {parseFloat(
                  inventorySummary.total_inventory_value || 0
                ).toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Total inventory worth across all products
              </Typography>

              {inventorySummary.low_stock_products &&
                inventorySummary.low_stock_products.length > 0 && (
                  <Box>
                    <Typography
                      variant="subtitle2"
                      color="error.main"
                      gutterBottom
                      sx={{ fontWeight: 600 }}
                    >
                      ⚠️ Low Stock Alerts:
                    </Typography>
                    <Box sx={{ maxHeight: 200, overflow: "auto" }}>
                      {inventorySummary.low_stock_products
                        .slice(0, 5)
                        .map((product) => (
                          <Box
                            key={product.id}
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              py: 1,
                              borderBottom: "1px solid",
                              borderColor: "divider",
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 500 }}
                            >
                              {product.name}
                            </Typography>
                            <Chip
                              label={`${product.quantity} left`}
                              size="small"
                              color="error"
                              variant="outlined"
                            />
                          </Box>
                        ))}
                    </Box>
                  </Box>
                )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Profit Chart */}
      <Card sx={{ mt: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Box>
              <Typography
                variant="h6"
                gutterBottom
                sx={{
                  fontWeight: 600,
                  background:
                    "linear-gradient(45deg, #059669, #0ea5e9, #f59e0b)",
                  backgroundClip: "text",
                  color: "transparent",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Daily Profit Analysis (Last 30 Days)
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Profit relative to inventory investment
              </Typography>
              {/* Color Legend */}
              <Box sx={{ display: "flex", gap: 2, mt: 2, flexWrap: "wrap" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      bgcolor: "#059669",
                      borderRadius: 1,
                    }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    Excellent (≥0.5%)
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      bgcolor: "#0ea5e9",
                      borderRadius: 1,
                    }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    Good (≥0.3%)
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      bgcolor: "#f59e0b",
                      borderRadius: 1,
                    }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    Moderate (≥0.1%)
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      bgcolor: "#84cc16",
                      borderRadius: 1,
                    }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    Low (&gt;0%)
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      bgcolor: "#ef4444",
                      borderRadius: 1,
                    }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    Loss
                  </Typography>
                </Box>
              </Box>
            </Box>
            <Chip
              label="Profit Analytics"
              color="success"
              size="small"
              sx={{ fontWeight: 600 }}
            />
          </Box>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesSummary.daily_profits || []}>
              <defs>
                <linearGradient
                  id="profitGradientExcellent"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.9} />
                  <stop offset="95%" stopColor="#059669" stopOpacity={0.6} />
                </linearGradient>
                <linearGradient
                  id="profitGradientGood"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.9} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.6} />
                </linearGradient>
                <linearGradient
                  id="profitGradientModerate"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.9} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.6} />
                </linearGradient>
                <linearGradient
                  id="profitGradientLow"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#84cc16" stopOpacity={0.9} />
                  <stop offset="95%" stopColor="#84cc16" stopOpacity={0.6} />
                </linearGradient>
                <linearGradient
                  id="profitGradientLoss"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.9} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.6} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e2e8f0"
                strokeOpacity={0.3}
              />
              <XAxis
                dataKey="date"
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#64748b"
                fontSize={12}
                tickFormatter={(value) => `₹${value}`}
                domain={calculateYAxisDomain}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: 8,
                  boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                }}
                formatter={(value) => {
                  const inventoryValue =
                    inventorySummary.total_inventory_value || 1;
                  const percentage = ((value / inventoryValue) * 100).toFixed(
                    3
                  );
                  const profitLevel =
                    percentage >= 0.5
                      ? "Excellent"
                      : percentage >= 0.3
                      ? "Good"
                      : percentage >= 0.1
                      ? "Moderate"
                      : value > 0
                      ? "Low"
                      : "Loss";
                  return [
                    `₹${parseFloat(value).toFixed(
                      2
                    )} (${percentage}% of inventory) - ${profitLevel}`,
                    "Profit",
                  ];
                }}
                labelStyle={{ color: "#374151", fontWeight: 600 }}
              />
              <ReferenceLine
                y={inventorySummary.total_inventory_value * 0.005}
                stroke="#94a3b8"
                strokeDasharray="5 5"
                label={{
                  value: "0.5% of Inventory Value",
                  position: "insideTopRight",
                }}
              />
              <Bar dataKey="profit" name="Daily Profit" radius={[6, 6, 0, 0]}>
                {(salesSummary.daily_profits || []).map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={getBarColor(entry.profit)}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </Box>
  );
}

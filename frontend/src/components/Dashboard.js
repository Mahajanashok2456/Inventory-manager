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

  // Historical data tracking for trend calculations
  const [historicalData, setHistoricalData] = useState({
    totalProducts: [],
    lowStockCount: [],
    todayOrders: [],
    todayRevenue: [],
    inventoryValue: [],
  });

  // Track previous values for comparison
  const [previousData, setPreviousData] = useState({
    totalProducts: 0,
    lowStockCount: 0,
    todayOrders: 0,
    todayRevenue: 0,
    inventoryValue: 0,
  });

  // Data-driven percentage calculations
  const calculateDataDrivenTrends = useMemo(() => {
    const currentData = {
      totalProducts: inventorySummary.total_products || 0,
      lowStockCount: inventorySummary.low_stock_count || 0,
      todayOrders: todayOrders.total_orders || 0,
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
  }, [inventorySummary, todayOrders, previousData, historicalData]);

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

      // Update previous data for comparison
      setPreviousData({
        totalProducts: inventorySummary.total_products || 0,
        lowStockCount: inventorySummary.low_stock_count || 0,
        todayOrders: todayOrders.total_orders || 0,
        todayRevenue: todayOrders.total_revenue || 0,
        inventoryValue: inventorySummary.total_inventory_value || 0,
      });

      // Update historical data
      updateHistoricalData({
        totalProducts: newInventoryData.total_products || 0,
        lowStockCount: newInventoryData.low_stock_count || 0,
        todayOrders: newTodayData.total_orders || 0,
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
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              sx={{
                borderRadius: 2,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                boxShadow: "0 4px 12px rgba(102, 126, 234, 0.4)",
              }}
            >
              Quick Actions
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
            title="Total Products"
            value={inventorySummary.total_products || 0}
            icon={<Inventory />}
            color="#4f46e5"
            trend={calculateDataDrivenTrends.totalProducts.trend}
            trendValue={calculateDataDrivenTrends.totalProducts.value}
            loading={loading}
            clickable={true}
            onClick={() => navigate("/inventory")}
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
            title="Today's Orders"
            value={todayOrders.total_orders || 0}
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
                    sx={{ fontWeight: 600 }}
                  >
                    Sales Trend (Last 30 Days)
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Daily revenue performance over time
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
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="divider" />
                  <XAxis dataKey="date" stroke="text.secondary" fontSize={12} />
                  <YAxis
                    stroke="text.secondary"
                    fontSize={12}
                    tickFormatter={(value) => `₹${value}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "background.paper",
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 2,
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                    formatter={(value) => [
                      `₹${parseFloat(value).toFixed(2)}`,
                      "Revenue",
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#4f46e5"
                    strokeWidth={3}
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
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Daily Profit Analysis (Last 30 Days)
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Profit trends and performance metrics
              </Typography>
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
                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#059669" stopOpacity={0.2} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="divider" />
              <XAxis dataKey="date" stroke="text.secondary" fontSize={12} />
              <YAxis
                stroke="text.secondary"
                fontSize={12}
                tickFormatter={(value) => `₹${value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "background.paper",
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 2,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
                formatter={(value) => [
                  `₹${parseFloat(value).toFixed(2)}`,
                  "Profit",
                ]}
              />
              <Bar
                dataKey="profit"
                fill="url(#colorProfit)"
                name="Daily Profit"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </Box>
  );
}

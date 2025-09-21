import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
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
  PieChart,
  Pie,
  Cell,
} from "recharts";
import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000/api";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

export default function Analytics() {
  const [salesData, setSalesData] = useState({});
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [salesResponse, categoryResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/orders/sales-summary/`, {
          params: { start_date: startDate, end_date: endDate },
        }),
        axios.get(`${API_BASE_URL}/orders/category-sales/`, {
          params: { start_date: startDate, end_date: endDate },
        }),
      ]);
      setSalesData({
        ...salesResponse.data,
        category_sales: categoryResponse.data,
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateFilter = () => {
    fetchAnalytics();
  };

  if (loading) {
    return <Typography>Loading analytics...</Typography>;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Analytics Dashboard
      </Typography>

      {/* Date Filter */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="End Date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <Button variant="contained" onClick={handleDateFilter}>
                Apply Filter
              </Button>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Typography variant="body2" color="textSecondary">
                {salesData.period?.start_date} to {salesData.period?.end_date}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Orders
              </Typography>
              <Typography variant="h4" component="h2">
                {salesData.summary?.total_orders || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Revenue
              </Typography>
              <Typography variant="h4" component="h2" color="primary">
                ₹{parseFloat(salesData.summary?.total_revenue || 0).toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Profit
              </Typography>
              <Typography variant="h4" component="h2" color="success.main">
                ₹{parseFloat(salesData.summary?.total_profit || 0).toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Profit Margin
              </Typography>
              <Typography variant="h4" component="h2" color="info.main">
                {parseFloat(salesData.summary?.profit_margin || 0).toFixed(1)}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        {/* Sales Trend Chart */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Daily Sales and Profit Trend
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={salesData.daily_sales || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip
                  formatter={(value, name) => [
                    `₹${parseFloat(value).toFixed(2)}`,
                    name,
                  ]}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#1976d2"
                  strokeWidth={2}
                  name="Daily Revenue"
                />
                <Line
                  type="monotone"
                  dataKey="profit"
                  stroke="#4caf50"
                  strokeWidth={2}
                  name="Daily Profit"
                  data={salesData.daily_profits || []}
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Top Products Chart */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Top Selling Products
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={salesData.top_products?.slice(0, 5) || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ product__name, total_quantity }) =>
                    `${product__name}: ${total_quantity}`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="total_quantity"
                >
                  {(salesData.top_products?.slice(0, 5) || []).map(
                    (entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    )
                  )}
                </Pie>
                <Tooltip
                  formatter={(value, name, props) => [
                    `${value} units`,
                    props.payload.product__name,
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Revenue Bar Chart */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Daily Revenue Breakdown
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesData.daily_sales || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip
                  formatter={(value) => [
                    `₹${parseFloat(value).toFixed(2)}`,
                    "Revenue",
                  ]}
                />
                <Legend />
                <Bar dataKey="revenue" fill="#1976d2" name="Daily Revenue" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Category Sales Table */}
        <Grid item xs={12}>
          <Paper>
            <Box sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Sales by Category
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Total Products Sold: {salesData.category_sales?.total_sold || 0}
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Category Name</TableCell>
                      <TableCell align="right">Products Sold</TableCell>
                      <TableCell align="right">Total Revenue</TableCell>
                      <TableCell align="right">Total Profit</TableCell>
                      <TableCell align="right">Profit Margin</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(salesData.category_sales?.category_sales || []).map(
                      (category, index) => (
                        <TableRow key={category.category_id || index}>
                          <TableCell component="th" scope="row">
                            {category.category_name}
                          </TableCell>
                          <TableCell align="right">
                            {category.total_quantity}
                          </TableCell>
                          <TableCell align="right">
                            ₹{parseFloat(category.total_revenue).toFixed(2)}
                          </TableCell>
                          <TableCell align="right">
                            ₹{parseFloat(category.total_profit).toFixed(2)}
                          </TableCell>
                          <TableCell align="right">
                            {category.total_revenue > 0
                              ? `${(
                                  (parseFloat(category.total_profit) /
                                    parseFloat(category.total_revenue)) *
                                  100
                                ).toFixed(1)}%`
                              : "0%"}
                          </TableCell>
                        </TableRow>
                      )
                    )}
                    {(!salesData.category_sales?.category_sales ||
                      salesData.category_sales.category_sales.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          No category sales data available for this period
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Top Products Table */}
        <Grid item xs={12}>
          <Paper>
            <Box sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Top Products Performance
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Product Name</TableCell>
                      <TableCell align="right">Units Sold</TableCell>
                      <TableCell align="right">Total Revenue</TableCell>
                      <TableCell align="right">Total Profit</TableCell>
                      <TableCell align="right">Avg. Profit/Unit</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(salesData.top_products || []).map((product, index) => (
                      <TableRow key={index}>
                        <TableCell component="th" scope="row">
                          {product.product__name}
                        </TableCell>
                        <TableCell align="right">
                          {product.total_quantity}
                        </TableCell>
                        <TableCell align="right">
                          ₹{parseFloat(product.total_revenue).toFixed(2)}
                        </TableCell>
                        <TableCell align="right">
                          ₹{parseFloat(product.total_profit).toFixed(2)}
                        </TableCell>
                        <TableCell align="right">
                          ₹
                          {(
                            parseFloat(product.total_profit) /
                            product.total_quantity
                          ).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!salesData.top_products ||
                      salesData.top_products.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          No sales data available for this period
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Chip,
  List,
  ListItem,
  ListItemText,
  Alert,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";
import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000/api";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([{ product: "", quantity: "" }]);
  const [notes, setNotes] = useState("");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ordersResponse, productsResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/orders/orders/`),
        axios.get(`${API_BASE_URL}/inventory/products/`),
      ]);
      setOrders(ordersResponse.data.results || ordersResponse.data);
      const productsData =
        productsResponse.data.results || productsResponse.data;
      setProducts(
        productsData.filter((p) => p.selling_price && p.quantity > 0)
      );
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = () => {
    setOrderItems([{ product: "", quantity: "" }]);
    setNotes("");
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setOrderItems([{ product: "", quantity: "" }]);
    setNotes("");
  };

  const handleAddItem = () => {
    setOrderItems([...orderItems, { product: "", quantity: "" }]);
  };

  const handleRemoveItem = (index) => {
    if (orderItems.length > 1) {
      const newItems = orderItems.filter((_, i) => i !== index);
      setOrderItems(newItems);
    }
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...orderItems];
    newItems[index][field] = value;
    setOrderItems(newItems);
  };

  const handleSubmit = async () => {
    try {
      const validItems = orderItems.filter(
        (item) => item.product && item.quantity > 0
      );

      if (validItems.length === 0) {
        alert("Please add at least one valid item");
        return;
      }

      const orderData = {
        notes,
        order_items: validItems.map((item) => ({
          product: parseInt(item.product),
          quantity: parseInt(item.quantity),
        })),
      };

      await axios.post(`${API_BASE_URL}/orders/orders/`, orderData);
      fetchData();
      handleCloseDialog();
    } catch (error) {
      console.error("Error creating order:", error);
      if (error.response && error.response.data) {
        alert("Error: " + JSON.stringify(error.response.data));
      }
    }
  };

  const handleViewOrder = async (orderId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/orders/orders/${orderId}/`
      );
      setSelectedOrder(response.data);
      setViewDialogOpen(true);
    } catch (error) {
      console.error("Error fetching order details:", error);
    }
  };

  const handleExportCSV = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/orders/export-csv/`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "sales_report.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting CSV:", error);
    }
  };

  const handleDeleteOrder = (order) => {
    setOrderToDelete(order);
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteOrder = async () => {
    try {
      await axios.delete(`${API_BASE_URL}/orders/orders/${orderToDelete.id}/`);
      fetchData();
      setDeleteConfirmOpen(false);
      setOrderToDelete(null);
    } catch (error) {
      console.error("Error deleting order:", error);
      alert("Error deleting order. Please try again.");
    }
  };

  const calculateItemTotal = (item) => {
    const product = products.find((p) => p.id === parseInt(item.product));
    if (product && item.quantity) {
      return product.selling_price * parseInt(item.quantity);
    }
    return 0;
  };

  const calculateOrderTotal = () => {
    return orderItems.reduce(
      (total, item) => total + calculateItemTotal(item),
      0
    );
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4" gutterBottom>
          Orders Management
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExportCSV}
            sx={{ mr: 2 }}
          >
            Export CSV
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenDialog}
          >
            New Order
          </Button>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Orders
              </Typography>
              <Typography variant="h5" component="h2">
                {orders.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Today's Orders
              </Typography>
              <Typography variant="h5" component="h2">
                {
                  orders.filter((order) => {
                    const today = new Date().toDateString();
                    const orderDate = new Date(order.order_date).toDateString();
                    return today === orderDate;
                  }).length
                }
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Revenue
              </Typography>
              <Typography variant="h5" component="h2">
                ₹
                {orders
                  .reduce(
                    (sum, order) => sum + parseFloat(order.total_amount),
                    0
                  )
                  .toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Orders Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order ID</TableCell>
              <TableCell>Date & Time</TableCell>
              <TableCell align="right">Items</TableCell>
              <TableCell align="right">Total Amount</TableCell>
              <TableCell align="right">Profit</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell component="th" scope="row">
                  #{order.id}
                </TableCell>
                <TableCell>
                  {new Date(order.order_date).toLocaleString()}
                </TableCell>
                <TableCell align="right">{order.items_count}</TableCell>
                <TableCell align="right">
                  ₹{parseFloat(order.total_amount).toFixed(2)}
                </TableCell>
                <TableCell align="right">
                  ₹{parseFloat(order.total_profit).toFixed(2)}
                </TableCell>
                <TableCell>
                  <Chip label="Completed" color="success" size="small" />
                </TableCell>
                <TableCell align="center">
                  <IconButton
                    color="primary"
                    onClick={() => handleViewOrder(order.id)}
                    size="small"
                  >
                    <ViewIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDeleteOrder(order)}
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {orders.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Alert severity="info">
                    No orders found. Create your first order!
                  </Alert>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* New Order Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Create New Order</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Order Items
            </Typography>

            {orderItems.map((item, index) => (
              <Grid
                container
                spacing={2}
                key={index}
                sx={{ mb: 2, alignItems: "center" }}
              >
                <Grid item xs={12} sm={5}>
                  <FormControl fullWidth>
                    <InputLabel>Product</InputLabel>
                    <Select
                      value={item.product}
                      onChange={(e) =>
                        handleItemChange(index, "product", e.target.value)
                      }
                      label="Product"
                    >
                      {products.map((product) => (
                        <MenuItem key={product.id} value={product.id}>
                          {product.name} - ₹
                          {parseFloat(product.selling_price).toFixed(2)} (Stock:{" "}
                          {product.quantity})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label="Quantity"
                    type="number"
                    value={item.quantity}
                    onChange={(e) =>
                      handleItemChange(index, "quantity", e.target.value)
                    }
                    inputProps={{ min: 1 }}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Typography variant="body2" color="textSecondary">
                    Subtotal: ₹{calculateItemTotal(item).toFixed(2)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={1}>
                  <IconButton
                    color="error"
                    onClick={() => handleRemoveItem(index)}
                    disabled={orderItems.length === 1}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Grid>
              </Grid>
            ))}

            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleAddItem}
              sx={{ mb: 3 }}
            >
              Add Item
            </Button>

            <TextField
              fullWidth
              label="Notes (Optional)"
              multiline
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              sx={{ mb: 2 }}
            />

            <Typography variant="h6" align="right">
              Total: ₹{calculateOrderTotal().toFixed(2)}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={calculateOrderTotal() === 0}
          >
            Create Order
          </Button>
        </DialogActions>
      </Dialog>

      {/* Order Details Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Order Details - #{selectedOrder?.id}</DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Box>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Order Date:</Typography>
                  <Typography>
                    {new Date(selectedOrder.order_date).toLocaleString()}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Total Amount:</Typography>
                  <Typography variant="h6" color="primary">
                    ₹{parseFloat(selectedOrder.total_amount).toFixed(2)}
                  </Typography>
                </Grid>
              </Grid>

              <Typography variant="h6" gutterBottom>
                Items:
              </Typography>
              <List>
                {selectedOrder.order_items?.map((item, index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={`${item.product_name} x ${item.quantity}`}
                      secondary={`₹${parseFloat(item.unit_price).toFixed(
                        2
                      )} each = ₹${parseFloat(item.subtotal).toFixed(
                        2
                      )} | Profit: ₹${parseFloat(item.profit).toFixed(2)}`}
                    />
                  </ListItem>
                ))}
              </List>

              {selectedOrder.notes && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2">Notes:</Typography>
                  <Typography>{selectedOrder.notes}</Typography>
                </Box>
              )}

              <Box sx={{ mt: 3, p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
                <Typography variant="h6">
                  Total Profit: ₹
                  {parseFloat(selectedOrder.total_profit).toFixed(2)}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Order Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Confirm Delete Order</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete Order #{orderToDelete?.id}? This
            action cannot be undone and will affect inventory levels.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button
            onClick={confirmDeleteOrder}
            variant="contained"
            color="error"
          >
            Delete Order
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

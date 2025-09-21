import React, { useState, useEffect, useMemo } from "react";
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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Chip,
  Alert,
  InputAdornment,
  Stack,
  Badge,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Warning as WarningIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  Clear as ClearIcon,
} from "@mui/icons-material";
import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000/api";

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    cost_price: "",
    selling_price: "",
    quantity: "",
    low_stock_threshold: "",
    description: "",
    sku: "",
  });
  const [categoryFormData, setCategoryFormData] = useState({
    name: "",
    description: "",
  });
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteConfirmCategoryOpen, setDeleteConfirmCategoryOpen] =
    useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.category_name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (product.sku &&
            product.sku.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter(
        (product) => product.category === parseInt(selectedCategory)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case "name":
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case "category":
          aValue = a.category_name.toLowerCase();
          bValue = b.category_name.toLowerCase();
          break;
        case "cost_price":
          aValue = parseFloat(a.cost_price);
          bValue = parseFloat(b.cost_price);
          break;
        case "selling_price":
          aValue = parseFloat(a.selling_price || 0);
          bValue = parseFloat(b.selling_price || 0);
          break;
        case "quantity":
          aValue = parseInt(a.quantity);
          bValue = parseInt(b.quantity);
          break;
        case "profit":
          aValue = parseFloat(a.profit_per_unit || 0);
          bValue = parseFloat(b.profit_per_unit || 0);
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (sortOrder === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [products, searchTerm, selectedCategory, sortBy, sortOrder]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsResponse, categoriesResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/inventory/products/`),
        axios.get(`${API_BASE_URL}/inventory/categories/`),
      ]);
      // Handle paginated response for products
      setProducts(productsResponse.data.results || productsResponse.data);
      // Handle paginated response for categories
      setCategories(categoriesResponse.data.results || categoriesResponse.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        category: product.category,
        cost_price: product.cost_price,
        selling_price: product.selling_price || "",
        quantity: product.quantity,
        low_stock_threshold: product.low_stock_threshold,
        description: product.description || "",
        sku: product.sku || "", // Keep existing SKU or empty string
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: "",
        category: "",
        cost_price: "",
        selling_price: "",
        quantity: "",
        low_stock_threshold: "10",
        description: "",
        sku: "", // Empty for new products (optional)
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingProduct(null);
    setFormData({
      name: "",
      category: "",
      cost_price: "",
      selling_price: "",
      quantity: "",
      low_stock_threshold: "10",
      description: "",
      sku: "", // Keep empty for optional SKU
    });
  };

  const handleSubmit = async () => {
    try {
      const url = editingProduct
        ? `${API_BASE_URL}/inventory/products/${editingProduct.id}/`
        : `${API_BASE_URL}/inventory/products/`;

      const method = editingProduct ? "put" : "post";

      // Prepare data for submission
      const submitData = { ...formData };

      // Handle empty SKU - either remove it or generate a unique one
      if (!submitData.sku || submitData.sku.trim() === "") {
        // Remove empty SKU to let backend handle it
        delete submitData.sku;
      }

      await axios[method](url, submitData);
      fetchData();
      handleCloseDialog();
    } catch (error) {
      console.error("Error saving product:", error);
      // Show user-friendly error message
      if (error.response && error.response.data) {
        alert(`Error: ${JSON.stringify(error.response.data)}`);
      } else {
        alert("Error saving product. Please check your data and try again.");
      }
    }
  };

  const handleDeleteProduct = (product) => {
    setItemToDelete(product);
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteProduct = async () => {
    try {
      await axios.delete(
        `${API_BASE_URL}/inventory/products/${itemToDelete.id}/`
      );
      fetchData();
      setDeleteConfirmOpen(false);
      setItemToDelete(null);
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Error deleting product. It may be referenced in orders.");
    }
  };

  const handleDeleteCategory = (category) => {
    setItemToDelete(category);
    setDeleteConfirmCategoryOpen(true);
  };

  const confirmDeleteCategory = async () => {
    try {
      await axios.delete(
        `${API_BASE_URL}/inventory/categories/${itemToDelete.id}/`
      );
      fetchData();
      setDeleteConfirmCategoryOpen(false);
      setItemToDelete(null);
    } catch (error) {
      console.error("Error deleting category:", error);
      alert(
        "Error deleting category. It may contain products or be referenced elsewhere."
      );
    }
  };

  const handleCategorySubmit = async () => {
    try {
      await axios.post(
        `${API_BASE_URL}/inventory/categories/`,
        categoryFormData
      );
      fetchData();
      setCategoryDialogOpen(false);
      setCategoryFormData({ name: "", description: "" });
    } catch (error) {
      console.error("Error creating category:", error);
    }
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Box>
            <Typography variant="h3" gutterBottom sx={{ fontWeight: 700 }}>
              Inventory Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage your products, categories, and stock levels
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => setCategoryDialogOpen(true)}
              sx={{ borderRadius: 2 }}
            >
              Add Category
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
              sx={{
                borderRadius: 2,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                boxShadow: "0 4px 12px rgba(102, 126, 234, 0.4)",
              }}
            >
              Add Product
            </Button>
          </Box>
        </Box>

        {/* Search and Filter Bar */}
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search products, categories, or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: searchTerm && (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => setSearchTerm("")}
                        edge="end"
                      >
                        <ClearIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ borderRadius: 2 }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Category Filter</InputLabel>
                <Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  label="Category Filter"
                  startAdornment={
                    selectedCategory ? (
                      <InputAdornment position="start">
                        <FilterIcon color="action" />
                      </InputAdornment>
                    ) : null
                  }
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="">
                    <em>All Categories</em>
                  </MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  label="Sort By"
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="name">Product Name</MenuItem>
                  <MenuItem value="category">Category</MenuItem>
                  <MenuItem value="cost_price">Cost Price</MenuItem>
                  <MenuItem value="selling_price">Selling Price</MenuItem>
                  <MenuItem value="quantity">Quantity</MenuItem>
                  <MenuItem value="profit">Profit/Unit</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() =>
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                }
                startIcon={<SortIcon />}
                sx={{ borderRadius: 2, height: "56px" }}
              >
                {sortOrder === "asc" ? "↑ Ascending" : "↓ Descending"}
              </Button>
            </Grid>
          </Grid>

          {/* Search Results Summary */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mt: 2,
              p: 2,
              backgroundColor: "background.paper",
              borderRadius: 2,
              border: 1,
              borderColor: "divider",
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Showing {filteredAndSortedProducts.length} of {products.length}{" "}
              products
            </Typography>
            {(searchTerm || selectedCategory) && (
              <Button
                size="small"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("");
                }}
                startIcon={<ClearIcon />}
              >
                Clear Filters
              </Button>
            )}
          </Box>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: "100%" }}>
            <CardContent sx={{ p: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 2,
                }}
              >
                <Typography
                  color="text.secondary"
                  variant="body2"
                  sx={{ fontWeight: 500 }}
                >
                  Total Products
                </Typography>
                <Badge color="primary" badgeContent={products.length} />
              </Box>
              <Typography variant="h4" component="h2" sx={{ fontWeight: 700 }}>
                {products.length}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                In inventory
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: "100%" }}>
            <CardContent sx={{ p: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 2,
                }}
              >
                <Typography
                  color="text.secondary"
                  variant="body2"
                  sx={{ fontWeight: 500 }}
                >
                  Low Stock Items
                </Typography>
                <Badge
                  color="warning"
                  badgeContent={products.filter((p) => p.is_low_stock).length}
                />
              </Box>
              <Typography
                variant="h4"
                component="h2"
                color="warning.main"
                sx={{ fontWeight: 700 }}
              >
                {products.filter((p) => p.is_low_stock).length}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Need attention
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: "100%" }}>
            <CardContent sx={{ p: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 2,
                }}
              >
                <Typography
                  color="text.secondary"
                  variant="body2"
                  sx={{ fontWeight: 500 }}
                >
                  Categories
                </Typography>
                <Badge color="success" badgeContent={categories.length} />
              </Box>
              <Typography variant="h4" component="h2" sx={{ fontWeight: 700 }}>
                {categories.length}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Product groups
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: "100%" }}>
            <CardContent sx={{ p: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 2,
                }}
              >
                <Typography
                  color="text.secondary"
                  variant="body2"
                  sx={{ fontWeight: 500 }}
                >
                  Filtered Results
                </Typography>
                <Badge
                  color="info"
                  badgeContent={filteredAndSortedProducts.length}
                />
              </Box>
              <Typography
                variant="h4"
                component="h2"
                color="info.main"
                sx={{ fontWeight: 700 }}
              >
                {filteredAndSortedProducts.length}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Currently shown
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Products Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.875rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Product Name
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.875rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Category
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.875rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Cost Price
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.875rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Selling Price
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.875rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Quantity
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.875rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Profit/Unit
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.875rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Status
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.875rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAndSortedProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell component="th" scope="row">
                    {product.name}
                  </TableCell>
                  <TableCell>{product.category_name}</TableCell>
                  <TableCell align="right">
                    ₹{parseFloat(product.cost_price).toFixed(2)}
                  </TableCell>
                  <TableCell align="right">
                    {product.selling_price
                      ? `₹${parseFloat(product.selling_price).toFixed(2)}`
                      : "Not set"}
                  </TableCell>
                  <TableCell align="right">{product.quantity}</TableCell>
                  <TableCell align="right">
                    ₹{parseFloat(product.profit_per_unit || 0).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    {product.is_low_stock ? (
                      <Chip
                        icon={<WarningIcon />}
                        label="Low Stock"
                        color="warning"
                        size="small"
                      />
                    ) : (
                      <Chip label="In Stock" color="success" size="small" />
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      color="primary"
                      onClick={() => handleOpenDialog(product)}
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDeleteProduct(product)}
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {filteredAndSortedProducts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Alert severity="info" sx={{ my: 4 }}>
                      {searchTerm || selectedCategory
                        ? "No products match your search criteria."
                        : "No products found. Add your first product!"}
                    </Alert>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Categories Section */}
      <Card sx={{ mt: 4 }}>
        <Box sx={{ p: 3, borderBottom: 1, borderColor: "divider" }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
            Categories
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your product categories
          </Typography>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.875rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Category Name
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.875rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Description
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.875rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Products Count
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.875rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell component="th" scope="row">
                    {category.name}
                  </TableCell>
                  <TableCell>
                    {category.description || "No description"}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={
                        products.filter((p) => p.category === category.id)
                          .length
                      }
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      color="error"
                      onClick={() => handleDeleteCategory(category)}
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {categories.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <Alert severity="info" sx={{ my: 4 }}>
                      No categories found. Add your first category!
                    </Alert>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Product Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingProduct ? "Edit Product" : "Add New Product"}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Product Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  label="Category"
                >
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Cost Price"
                type="number"
                value={formData.cost_price}
                onChange={(e) =>
                  setFormData({ ...formData, cost_price: e.target.value })
                }
                InputProps={{ startAdornment: "₹" }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Selling Price"
                type="number"
                value={formData.selling_price}
                onChange={(e) =>
                  setFormData({ ...formData, selling_price: e.target.value })
                }
                InputProps={{ startAdornment: "₹" }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({ ...formData, quantity: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Low Stock Threshold"
                type="number"
                value={formData.low_stock_threshold}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    low_stock_threshold: e.target.value,
                  })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="SKU (Optional)"
                value={formData.sku}
                onChange={(e) =>
                  setFormData({ ...formData, sku: e.target.value })
                }
                helperText="Leave empty to auto-generate or enter unique SKU"
                placeholder="e.g., PROD-001"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description (Optional)"
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingProduct ? "Update" : "Add"} Product
          </Button>
        </DialogActions>
      </Dialog>

      {/* Category Dialog */}
      <Dialog
        open={categoryDialogOpen}
        onClose={() => setCategoryDialogOpen(false)}
      >
        <DialogTitle>Add New Category</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Category Name"
            fullWidth
            variant="outlined"
            value={categoryFormData.name}
            onChange={(e) =>
              setCategoryFormData({ ...categoryFormData, name: e.target.value })
            }
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={categoryFormData.description}
            onChange={(e) =>
              setCategoryFormData({
                ...categoryFormData,
                description: e.target.value,
              })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCategoryDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCategorySubmit} variant="contained">
            Add Category
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Product Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Confirm Delete Product</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{itemToDelete?.name}"? This action
            cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button
            onClick={confirmDeleteProduct}
            variant="contained"
            color="error"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Category Confirmation Dialog */}
      <Dialog
        open={deleteConfirmCategoryOpen}
        onClose={() => setDeleteConfirmCategoryOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Confirm Delete Category</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete category "{itemToDelete?.name}"?
            This will also delete all products in this category. This action
            cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmCategoryOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={confirmDeleteCategory}
            variant="contained"
            color="error"
          >
            Delete Category
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

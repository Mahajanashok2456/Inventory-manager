# Sales Calculation Process Documentation

## Overview

This document explains how the category-based sales aggregation system calculates and displays sales data across different categories in the inventory management system.

## System Architecture

### Backend Components

- **Orders Models**: `Order` and `OrderItem` models store sales transactions
- **Inventory Models**: `Product` and `Category` models store product information
- **Orders Views**: Handle API requests for sales data aggregation
- **Analytics Views**: Process and return calculated sales metrics

### Frontend Components

- **Dashboard**: Displays real-time sales statistics
- **Analytics**: Shows detailed sales breakdowns by category
- **Inventory**: Manages product and category data

## Data Flow

### 1. Order Creation Process

```
Customer Order → OrderItem Creation → Product Quantity Update → Order Totals Calculation
```

**Order Model Fields:**

- `order_date`: Timestamp of order creation
- `total_amount`: Sum of all order items
- `total_profit`: Sum of all item profits

**OrderItem Model Fields:**

- `product`: Foreign key to Product
- `quantity`: Number of items sold
- `unit_price`: Selling price per item
- `unit_cost`: Cost price per item
- `subtotal`: `unit_price * quantity`
- `profit`: `(unit_price - unit_cost) * quantity`

### 2. Category Sales Aggregation Process

#### Backend Calculation Logic (`category_sales_summary` endpoint)

```python
# 1. Get order items within date range
order_items = OrderItem.objects.filter(
    order__order_date__date__range=[start_date, end_date]
)

# 2. Group by category and aggregate
category_sales = {}
for item in order_items:
    category_id = item.product.category.id
    category_name = item.product.category.name

    if category_id not in category_sales:
        category_sales[category_id] = {
            'category_id': category_id,
            'category_name': category_name,
            'total_quantity': 0,
            'total_revenue': 0,
            'total_profit': 0,
            'products_sold': 0
        }

    # Update category totals
    category_sales[category_id]['total_quantity'] += item.quantity
    category_sales[category_id]['total_revenue'] += item.subtotal
    category_sales[category_id]['total_profit'] += item.profit
    category_sales[category_id]['products_sold'] += 1

# 3. Calculate overall total
total_sold = sum(cat['total_quantity'] for cat in category_sales.values())
```

#### API Response Structure

```json
{
  "period": {
    "start_date": "2025-08-21",
    "end_date": "2025-09-20"
  },
  "total_sold": 3,
  "category_sales": [
    {
      "category_id": 1,
      "category_name": "Electronics",
      "total_quantity": 2,
      "total_revenue": 2000.0,
      "total_profit": 400.0,
      "products_sold": 2
    },
    {
      "category_id": 2,
      "category_name": "Clothing",
      "total_quantity": 1,
      "total_revenue": 500.0,
      "total_profit": 100.0,
      "products_sold": 1
    }
  ]
}
```

### 3. Frontend Display Logic

#### Analytics Component Data Fetching

```javascript
const fetchAnalytics = async () => {
  const [salesResponse, categoryResponse] = await Promise.all([
    axios.get("/orders/sales-summary/"),
    axios.get("/orders/category-sales/"),
  ]);

  setSalesData({
    ...salesResponse.data,
    category_sales: categoryResponse.data,
  });
};
```

#### Category Sales Table Display

- **Category Name**: Display name of the product category
- **Products Sold**: Total quantity of items sold in this category
- **Total Revenue**: Sum of all sales amounts for this category
- **Total Profit**: Sum of all profits for this category
- **Profit Margin**: `(total_profit / total_revenue) * 100`

#### Total Calculation Verification

```
Total Sold = Category 1 Quantity + Category 2 Quantity + ... + Category N Quantity
Example:
- Category 1: 2 products sold
- Category 2: 1 product sold
- Total: 3 products sold ✅
```

## Calculation Examples

### Example 1: Simple Order

```
Order #1:
- Product A (Electronics): 1 unit @ ₹500 (Profit: ₹100)
- Product B (Electronics): 1 unit @ ₹300 (Profit: ₹60)

Category Aggregation:
- Electronics:
  - total_quantity: 2
  - total_revenue: ₹800
  - total_profit: ₹160
  - products_sold: 2

Total Sold: 2
```

### Example 2: Multi-Category Order

```
Order #2:
- Product C (Electronics): 1 unit @ ₹1000 (Profit: ₹200)
- Product D (Clothing): 1 unit @ ₹500 (Profit: ₹100)

Category Aggregation:
- Electronics:
  - total_quantity: 1
  - total_revenue: ₹1000
  - total_profit: ₹200
  - products_sold: 1
- Clothing:
  - total_quantity: 1
  - total_revenue: ₹500
  - total_profit: ₹100
  - products_sold: 1

Total Sold: 2
```

### Example 3: Combined Results

```
Combined from Example 1 & 2:
- Electronics: 3 products sold, ₹1800 revenue, ₹360 profit
- Clothing: 1 product sold, ₹500 revenue, ₹100 profit
- Total Sold: 4 products ✅
```

## API Endpoints

### 1. Category Sales Summary

- **URL**: `/api/orders/category-sales/`
- **Method**: GET
- **Query Parameters**:
  - `start_date`: YYYY-MM-DD (optional, defaults to 30 days ago)
  - `end_date`: YYYY-MM-DD (optional, defaults to today)
- **Response**: Category-based sales aggregation

### 2. General Sales Summary

- **URL**: `/api/orders/sales-summary/`
- **Method**: GET
- **Query Parameters**: Same as above
- **Response**: Overall sales statistics

### 3. Today's Orders

- **URL**: `/api/orders/today-orders/`
- **Method**: GET
- **Response**: Today's order summary

## Data Validation

### 1. Database Constraints

- **SKU Uniqueness**: Each product must have a unique SKU
- **Positive Values**: Prices and quantities must be positive
- **Foreign Key Integrity**: OrderItems must reference valid Products

### 2. Calculation Validation

- **Subtotal**: `unit_price * quantity`
- **Profit**: `(unit_price - unit_cost) * quantity`
- **Total Amount**: Sum of all item subtotals
- **Total Profit**: Sum of all item profits

### 3. Aggregation Validation

- **Category Totals**: Sum of all items in category
- **Overall Total**: Sum of all category totals
- **Date Range Filtering**: Only include orders within specified range

## Error Handling

### Backend Errors

- **500 Internal Server Error**: Database constraint violations (e.g., duplicate SKU)
- **404 Not Found**: Invalid product or category references
- **400 Bad Request**: Invalid date formats or parameters

### Frontend Errors

- **Network Errors**: API connectivity issues
- **Data Parsing Errors**: Invalid JSON responses
- **Display Errors**: Missing or malformed data

## Performance Considerations

### Database Optimization

- **Select Related**: Uses `select_related()` for foreign key optimization
- **Date Filtering**: Efficient date range queries
- **Aggregation**: Single query for all calculations

### Frontend Optimization

- **Parallel Requests**: Fetches multiple endpoints simultaneously
- **Memoization**: Caches calculated values
- **Lazy Loading**: Loads data only when needed

## Troubleshooting

### Common Issues

1. **Incorrect Totals**

   - Check: Verify all order items are included in date range
   - Fix: Ensure proper date filtering in queries

2. **Missing Categories**

   - Check: Verify products have valid category assignments
   - Fix: Update products with missing category references

3. **Zero Values**
   - Check: Confirm orders exist within date range
   - Fix: Verify order creation process is working

### Debug Steps

1. **Check API Response**: Verify `/api/orders/category-sales/` returns correct data
2. **Verify Database**: Check raw order and order item data
3. **Test Date Ranges**: Try different date ranges to isolate issues
4. **Check Calculations**: Manually verify totals match expected values

## Maintenance

### Regular Tasks

- **Data Cleanup**: Remove old orders if needed
- **Performance Monitoring**: Track query performance
- **Error Monitoring**: Log and address calculation errors

### Updates

- **Schema Changes**: Update calculations for model changes
- **New Categories**: Ensure new categories are included in aggregations
- **API Changes**: Update frontend calls for endpoint changes

---

**Last Updated**: September 21, 2025
**Version**: 1.0
**Author**: System Documentation

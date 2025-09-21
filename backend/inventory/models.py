from django.db import models
from django.core.validators import MinValueValidator
from decimal import Decimal

class Category(models.Model):
    """Product categories like 'Snacks', 'Beverages', etc."""
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Categories"
        ordering = ['name']

    def __str__(self):
        return self.name

class Product(models.Model):
    """Individual products in the inventory"""
    name = models.CharField(max_length=200)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='products')
    cost_price = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    selling_price = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))],
        null=True,
        blank=True
    )
    quantity = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0)]
    )
    low_stock_threshold = models.IntegerField(default=10)
    description = models.TextField(blank=True, null=True)
    sku = models.CharField(max_length=100, unique=True, blank=True, null=True)  # Stock Keeping Unit
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']
        unique_together = ['name', 'category']

    def __str__(self):
        return f"{self.name} ({self.category.name})"

    @property
    def profit_per_unit(self):
        """Calculate profit per unit"""
        if self.selling_price:
            return self.selling_price - self.cost_price
        return Decimal('0.00')

    @property
    def profit_margin(self):
        """Calculate profit margin percentage"""
        if self.selling_price and self.selling_price > 0:
            return ((self.selling_price - self.cost_price) / self.selling_price) * 100
        return Decimal('0.00')

    @property
    def is_low_stock(self):
        """Check if product is below low stock threshold"""
        return self.quantity <= self.low_stock_threshold

    @property
    def total_value(self):
        """Calculate total inventory value (cost price * quantity)"""
        return self.cost_price * self.quantity

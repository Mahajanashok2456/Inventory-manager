from django.db import models
from django.core.validators import MinValueValidator
from decimal import Decimal
from inventory.models import Product

class Order(models.Model):
    """Main order/transaction record"""
    order_date = models.DateTimeField(auto_now_add=True)
    total_amount = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        default=Decimal('0.00')
    )
    total_profit = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        default=Decimal('0.00')
    )
    notes = models.TextField(blank=True, null=True)

    class Meta:
        ordering = ['-order_date']

    def __str__(self):
        return f"Order #{self.id} - {self.order_date.strftime('%Y-%m-%d %H:%M')}"

    def calculate_totals(self):
        """Calculate total amount and profit for this order"""
        order_items = self.order_items.all()
        total_amount = sum(item.subtotal for item in order_items)
        total_profit = sum(item.profit for item in order_items)
        
        self.total_amount = total_amount
        self.total_profit = total_profit
        self.save()

class OrderItem(models.Model):
    """Individual items within an order"""
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='order_items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField(validators=[MinValueValidator(1)])
    unit_price = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        help_text="Selling price at the time of sale"
    )
    unit_cost = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        help_text="Cost price at the time of sale"
    )
    
    class Meta:
        unique_together = ['order', 'product']

    def __str__(self):
        return f"{self.product.name} x{self.quantity}"

    @property
    def subtotal(self):
        """Calculate subtotal for this order item"""
        return self.unit_price * self.quantity

    @property
    def profit(self):
        """Calculate profit for this order item"""
        return (self.unit_price - self.unit_cost) * self.quantity

    def save(self, *args, **kwargs):
        # Store current prices if not set
        if not self.unit_price:
            self.unit_price = self.product.selling_price or self.product.cost_price
        if not self.unit_cost:
            self.unit_cost = self.product.cost_price
            
        super().save(*args, **kwargs)
        
        # Update product quantity
        self.product.quantity -= self.quantity
        self.product.save()
        
        # Update order totals
        self.order.calculate_totals()

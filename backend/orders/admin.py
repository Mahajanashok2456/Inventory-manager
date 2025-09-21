from django.contrib import admin
from .models import Order, OrderItem

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ['subtotal', 'profit']

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'order_date', 'total_amount', 'total_profit']
    list_filter = ['order_date']
    ordering = ['-order_date']
    readonly_fields = ['total_amount', 'total_profit']
    inlines = [OrderItemInline]

@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = [
        'order', 'product', 'quantity', 'unit_price', 
        'unit_cost', 'subtotal', 'profit'
    ]
    list_filter = ['order__order_date', 'product__category']
    readonly_fields = ['subtotal', 'profit']

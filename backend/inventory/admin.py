from django.contrib import admin
from .models import Category, Product

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'description', 'created_at']
    search_fields = ['name']
    ordering = ['name']

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'category', 'cost_price', 'selling_price', 
        'quantity', 'is_low_stock', 'profit_per_unit'
    ]
    list_filter = ['category', 'created_at']
    search_fields = ['name', 'sku']
    ordering = ['name']
    list_editable = ['selling_price', 'quantity']
    
    def is_low_stock(self, obj):
        return obj.is_low_stock
    is_low_stock.boolean = True
    is_low_stock.short_description = 'Low Stock'

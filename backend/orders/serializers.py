from rest_framework import serializers
from django.db import transaction
from .models import Order, OrderItem
from inventory.models import Product

class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    profit = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    
    class Meta:
        model = OrderItem
        fields = [
            'id', 'product', 'product_name', 'quantity', 
            'unit_price', 'unit_cost', 'subtotal', 'profit'
        ]
        read_only_fields = ['unit_price', 'unit_cost']

class OrderListSerializer(serializers.ModelSerializer):
    items_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Order
        fields = [
            'id', 'order_date', 'total_amount', 'total_profit', 
            'items_count', 'notes'
        ]
    
    def get_items_count(self, obj):
        return obj.order_items.count()

class OrderDetailSerializer(serializers.ModelSerializer):
    order_items = OrderItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = Order
        fields = [
            'id', 'order_date', 'total_amount', 'total_profit', 
            'notes', 'order_items'
        ]

class OrderItemCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ['product', 'quantity']
    
    def validate_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError("Quantity must be greater than 0.")
        return value
    
    def validate_product(self, value):
        if not value.selling_price:
            raise serializers.ValidationError("Product must have a selling price set.")
        return value

class OrderCreateSerializer(serializers.ModelSerializer):
    order_items = OrderItemCreateSerializer(many=True, write_only=True)
    
    class Meta:
        model = Order
        fields = ['notes', 'order_items']
    
    def validate_order_items(self, value):
        if not value:
            raise serializers.ValidationError("Order must have at least one item.")
        
        # Check stock availability
        for item_data in value:
            product = item_data['product']
            quantity = item_data['quantity']
            
            if product.quantity < quantity:
                raise serializers.ValidationError(
                    f"Insufficient stock for {product.name}. "
                    f"Available: {product.quantity}, Requested: {quantity}"
                )
        
        return value
    
    @transaction.atomic
    def create(self, validated_data):
        order_items_data = validated_data.pop('order_items')
        order = Order.objects.create(**validated_data)
        
        for item_data in order_items_data:
            product = item_data['product']
            quantity = item_data['quantity']
            
            # Create order item with current prices
            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=quantity,
                unit_price=product.selling_price,
                unit_cost=product.cost_price
            )
        
        return order
from rest_framework import generics, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db.models import Q
from .models import Category, Product
from .serializers import (
    CategorySerializer, ProductListSerializer, ProductDetailSerializer,
    ProductCreateSerializer, ProductUpdateSerializer
)

class CategoryListCreateView(generics.ListCreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

class ProductListCreateView(generics.ListCreateAPIView):
    queryset = Product.objects.select_related('category')
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ProductCreateSerializer
        return ProductListSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by category
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category_id=category)
        
        # Filter by low stock
        low_stock = self.request.query_params.get('low_stock')
        if low_stock and low_stock.lower() == 'true':
            queryset = [product for product in queryset if product.is_low_stock]
        
        # Search by name
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | Q(sku__icontains=search)
            )
        
        return queryset

class ProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Product.objects.select_related('category')
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return ProductUpdateSerializer
        return ProductDetailSerializer

@api_view(['GET'])
def inventory_summary(request):
    """Get inventory summary statistics"""
    products = Product.objects.select_related('category')
    
    total_products = products.count()
    total_categories = Category.objects.count()
    low_stock_products = [p for p in products if p.is_low_stock]
    
    # Calculate inventory values
    total_inventory_value = sum(product.total_value for product in products)
    total_sold_value = sum(product.total_sold_value for product in products)
    
    # Calculate quantities
    total_quantity = sum(product.quantity for product in products)
    total_sold_quantity = sum(product.sold_quantity for product in products)
    total_available_quantity = sum(product.available_quantity for product in products)
    
    return Response({
        'total_products': total_products,
        'total_categories': total_categories,
        'low_stock_count': len(low_stock_products),
        'total_inventory_value': total_inventory_value,
        'total_sold_value': total_sold_value,
        'total_quantity': total_quantity,
        'total_sold_quantity': total_sold_quantity,
        'total_available_quantity': total_available_quantity,
        'inventory_turnover_percentage': (total_sold_quantity / total_quantity * 100) if total_quantity > 0 else 0,
        'low_stock_products': [
            {
                'id': p.id,
                'name': p.name,
                'available_quantity': p.available_quantity,
                'threshold': p.low_stock_threshold
            } for p in low_stock_products
        ]
    })

@api_view(['POST'])
def update_stock(request):
    """Bulk update stock quantities"""
    updates = request.data.get('updates', [])
    
    if not updates:
        return Response(
            {'error': 'No updates provided'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    updated_products = []
    
    for update in updates:
        try:
            product_id = update.get('product_id')
            new_quantity = update.get('quantity')
            
            if product_id is None or new_quantity is None:
                continue
                
            product = Product.objects.get(id=product_id)
            product.quantity = new_quantity
            product.save()
            
            updated_products.append({
                'id': product.id,
                'name': product.name,
                'quantity': product.quantity
            })
            
        except Product.DoesNotExist:
            continue
    
    return Response({
        'message': f'Updated {len(updated_products)} products',
        'updated_products': updated_products
    })
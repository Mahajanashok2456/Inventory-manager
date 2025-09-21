from rest_framework import generics, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.http import HttpResponse
from django.db.models import Sum, Q, F
from django.utils import timezone
from datetime import datetime, timedelta
import csv
from .models import Order, OrderItem
from .serializers import (
    OrderListSerializer, OrderDetailSerializer, OrderCreateSerializer
)

class OrderListCreateView(generics.ListCreateAPIView):
    queryset = Order.objects.prefetch_related('order_items__product')
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return OrderCreateSerializer
        return OrderListSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by date range
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        
        if start_date:
            try:
                start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
                queryset = queryset.filter(order_date__date__gte=start_date)
            except ValueError:
                pass
        
        if end_date:
            try:
                end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
                queryset = queryset.filter(order_date__date__lte=end_date)
            except ValueError:
                pass
        
        return queryset

class OrderDetailView(generics.RetrieveDestroyAPIView):
    queryset = Order.objects.prefetch_related('order_items__product')
    serializer_class = OrderDetailSerializer

@api_view(['GET'])
def sales_summary(request):
    """Get sales summary statistics"""
    # Get date range from query params (default to last 30 days)
    end_date = timezone.now().date()
    start_date = end_date - timedelta(days=30)
    
    if request.query_params.get('start_date'):
        try:
            start_date = datetime.strptime(request.query_params['start_date'], '%Y-%m-%d').date()
        except ValueError:
            pass
    
    if request.query_params.get('end_date'):
        try:
            end_date = datetime.strptime(request.query_params['end_date'], '%Y-%m-%d').date()
        except ValueError:
            pass
    
    # Get orders in date range
    orders = Order.objects.filter(
        order_date__date__range=[start_date, end_date]
    )
    
    # Calculate totals
    total_orders = orders.count()
    total_revenue = orders.aggregate(Sum('total_amount'))['total_amount__sum'] or 0
    total_profit = orders.aggregate(Sum('total_profit'))['total_profit__sum'] or 0
    
    # Daily sales data for charts
    daily_sales = {}
    daily_profits = {}
    
    for order in orders:
        date_key = order.order_date.date().isoformat()
        daily_sales[date_key] = daily_sales.get(date_key, 0) + float(order.total_amount)
        daily_profits[date_key] = daily_profits.get(date_key, 0) + float(order.total_profit)
    
    # Top selling products
    top_products = (
        OrderItem.objects
        .filter(order__order_date__date__range=[start_date, end_date])
        .values('product__name')
        .annotate(
            total_quantity=Sum('quantity'),
            total_revenue=Sum(F('unit_price') * F('quantity')),
            total_profit=Sum((F('unit_price') - F('unit_cost')) * F('quantity'))
        )
        .order_by('-total_quantity')[:10]
    )
    
    return Response({
        'period': {
            'start_date': start_date,
            'end_date': end_date
        },
        'summary': {
            'total_orders': total_orders,
            'total_revenue': total_revenue,
            'total_profit': total_profit,
            'profit_margin': (float(total_profit) / float(total_revenue) * 100) if total_revenue > 0 else 0
        },
        'daily_sales': [
            {'date': date, 'revenue': revenue} 
            for date, revenue in sorted(daily_sales.items())
        ],
        'daily_profits': [
            {'date': date, 'profit': profit} 
            for date, profit in sorted(daily_profits.items())
        ],
        'top_products': list(top_products)
    })

@api_view(['GET'])
def export_sales_csv(request):
    """Export sales data as CSV"""
    # Get date range
    end_date = timezone.now().date()
    start_date = end_date - timedelta(days=30)
    
    if request.query_params.get('start_date'):
        try:
            start_date = datetime.strptime(request.query_params['start_date'], '%Y-%m-%d').date()
        except ValueError:
            pass
    
    if request.query_params.get('end_date'):
        try:
            end_date = datetime.strptime(request.query_params['end_date'], '%Y-%m-%d').date()
        except ValueError:
            pass
    
    # Create CSV response
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = f'attachment; filename="sales_report_{start_date}_to_{end_date}.csv"'
    
    writer = csv.writer(response)
    
    # Write header
    writer.writerow([
        'Order ID', 'Date', 'Product', 'Category', 'Quantity', 
        'Unit Price', 'Unit Cost', 'Subtotal', 'Profit'
    ])
    
    # Get order items in date range
    order_items = (
        OrderItem.objects
        .select_related('order', 'product', 'product__category')
        .filter(order__order_date__date__range=[start_date, end_date])
        .order_by('-order__order_date')
    )
    
    # Write data rows
    for item in order_items:
        writer.writerow([
            item.order.id,
            item.order.order_date.strftime('%Y-%m-%d %H:%M'),
            item.product.name,
            item.product.category.name,
            item.quantity,
            item.unit_price,
            item.unit_cost,
            item.subtotal,
            item.profit
        ])
    
    return response

@api_view(['GET'])
def today_orders(request):
    """Get today's orders summary"""
    today = timezone.now().date()
    orders = Order.objects.filter(order_date__date=today)

    total_orders = orders.count()
    total_revenue = orders.aggregate(Sum('total_amount'))['total_amount__sum'] or 0
    total_profit = orders.aggregate(Sum('total_profit'))['total_profit__sum'] or 0

    return Response({
        'date': today,
        'total_orders': total_orders,
        'total_revenue': total_revenue,
        'total_profit': total_profit,
        'orders': OrderListSerializer(orders, many=True).data
    })

@api_view(['GET'])
def category_sales_summary(request):
    """Get sales summary by category"""
    # Get date range from query params (default to last 30 days)
    end_date = timezone.now().date()
    start_date = end_date - timedelta(days=30)

    if request.query_params.get('start_date'):
        try:
            start_date = datetime.strptime(request.query_params['start_date'], '%Y-%m-%d').date()
        except ValueError:
            pass

    if request.query_params.get('end_date'):
        try:
            end_date = datetime.strptime(request.query_params['end_date'], '%Y-%m-%d').date()
        except ValueError:
            pass

    # Get order items in date range with category information
    order_items = (
        OrderItem.objects
        .select_related('product', 'product__category', 'order')
        .filter(order__order_date__date__range=[start_date, end_date])
    )

    # Calculate sales by category
    category_sales = {}
    total_sold = 0

    for item in order_items:
        category_id = item.product.category.id if item.product.category else None
        category_name = item.product.category.name if item.product.category else 'Uncategorized'

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
        category_sales[category_id]['total_revenue'] += float(item.subtotal)
        category_sales[category_id]['total_profit'] += float(item.profit)
        category_sales[category_id]['products_sold'] += 1

        total_sold += item.quantity

    # Convert to list format for frontend
    category_sales_list = list(category_sales.values())

    # Sort by total quantity sold (descending)
    category_sales_list.sort(key=lambda x: x['total_quantity'], reverse=True)

    return Response({
        'period': {
            'start_date': start_date,
            'end_date': end_date
        },
        'total_sold': total_sold,
        'category_sales': category_sales_list
    })
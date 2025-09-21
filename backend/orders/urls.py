from django.urls import path
from . import views

app_name = 'orders'

urlpatterns = [
    # Orders
    path('orders/', views.OrderListCreateView.as_view(), name='order-list'),
    path('orders/<int:pk>/', views.OrderDetailView.as_view(), name='order-detail'),
    
    # Sales analytics
    path('sales-summary/', views.sales_summary, name='sales-summary'),
    path('today-orders/', views.today_orders, name='today-orders'),
    path('export-csv/', views.export_sales_csv, name='export-csv'),
    path('category-sales/', views.category_sales_summary, name='category-sales-summary'),
]
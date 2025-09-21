# Mahajan's Store - Inventory Management System

A comprehensive inventory, sales, and pricing management system for Mahajan's Store.

## Project Overview

This system digitizes and automates inventory management, replacing manual bookkeeping with an accurate, time-saving, and easy-to-use platform to track business performance and profitability.

## Tech Stack

- **Frontend**: React.js with Material-UI
- **Backend**: Django & Django REST Framework
- **Database**: MySQL
- **Charts**: Recharts
- **Testing**: Playwright

## Features

### Core Features (Version 1.0)

- Stock Management: CRUD functionality for product categories and items
- Order Logging: Simple form to add sales with automatic stock updates
- Price Management: Interface to view and modify selling prices
- Analytics Dashboard: Key metrics and visual performance graphs
- CSV Export: One-click sales report downloads

### Future Features

- Low-Stock Alerts
- User Authentication
- Enhanced Reporting

## Project Structure

```
manager/
├── backend/           # Django backend
├── frontend/          # React frontend
├── docs/             # Documentation
├── tests/            # E2E tests with Playwright
└── deployment/       # Deployment configurations
```

## Quick Start

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

## Development Workflow

1. **Setup**: Add product categories and items with cost prices
2. **Pricing**: Set selling prices for products
3. **Sales Recording**: Log daily sales transactions
4. **Analytics**: View performance dashboards and export reports

## Success Criteria

- User adoption for daily operations
- 100% data accuracy in stock counts and profit calculations
- 50% reduction in time for inventory and sales management
- Intuitive user experience for business decision making

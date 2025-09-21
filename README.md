# 🏪 Mahajan's Inventory Manager

> A comprehensive, modern inventory management system built with Django REST API and React frontend for small to medium businesses.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Django](https://img.shields.io/badge/Django-5.2.6-green)
![React](https://img.shields.io/badge/React-19.1.1-blue)
![Status](https://img.shields.io/badge/status-Beta-orange)

## 🎯 Overview

**Mahajan's Inventory Manager** is a full-stack web application designed to streamline inventory management, order processing, and business analytics. Built for modern businesses that need accurate, real-time inventory tracking with powerful analytics capabilities.

### 🚀 Key Benefits

- **Real-time inventory tracking** with automatic stock updates
- **Comprehensive order management** with profit calculations
- **Interactive analytics dashboard** with visual insights
- **Category-based organization** for better product management
- **Responsive design** optimized for all devices

## 🛠️ Tech Stack

### Backend

- **Framework:** Django 5.2.6 + Django REST Framework 3.16.1
- **Database:** SQLite (development) / MySQL (production)
- **API:** RESTful API with comprehensive endpoints
- **CORS:** django-cors-headers for frontend integration

### Frontend

- **Framework:** React 19.1.1 with modern hooks
- **UI Library:** Material-UI (MUI) v7.3.2 with emotion styling
- **Routing:** React Router DOM v7.9.1
- **Charts:** Recharts v3.2.1 for data visualization
- **HTTP Client:** Axios v1.12.2
- **Data Grid:** MUI X Data Grid v8.11.3

### Development Tools

- **Testing:** React Testing Library + Jest
- **Build Tool:** Create React App
- **Version Control:** Git

## ✨ Features

### 🎛️ Core Functionality

#### **Inventory Management**

- ✅ Product categories with descriptions
- ✅ Product CRUD operations with validation
- ✅ Stock quantity tracking with low-stock alerts
- ✅ Cost price and selling price management
- ✅ SKU (Stock Keeping Unit) support
- ✅ Real-time stock updates during sales

#### **Order Processing**

- ✅ Complete order management system
- ✅ Multi-item orders with automatic calculations
- ✅ Real-time profit tracking per order
- ✅ Order history with detailed item breakdowns
- ✅ Automatic inventory deduction

#### **Analytics & Reporting**

- ✅ Interactive dashboard with key metrics
- ✅ Sales trend analysis with charts
- ✅ Profit tracking and visualization
- ✅ Low stock alerts and notifications
- ✅ Category-wise performance metrics

#### **User Interface**

- ✅ Modern, responsive Material-UI design
- ✅ Dark/light theme support
- ✅ Mobile-optimized interface
- ✅ Real-time data updates
- ✅ Intuitive navigation and workflows

### 🔮 Planned Features (v2.0)

- 🔒 User authentication and role management
- 📊 Advanced reporting with PDF exports
- 📱 Progressive Web App (PWA) support
- 🔔 Email notifications for low stock
- 📈 Advanced analytics with forecasting
- 🏪 Multi-store support

## 📁 Project Structure

```
mahajan-inventory-manager/
├── 📁 backend/                 # Django REST API
│   ├── 📁 backend/            # Main Django project
│   │   ├── settings.py        # Django configuration
│   │   ├── urls.py           # URL routing
│   │   └── wsgi.py           # WSGI configuration
│   ├── 📁 inventory/          # Inventory app
│   │   ├── models.py         # Product & Category models
│   │   ├── serializers.py    # API serializers
│   │   ├── views.py          # API views
│   │   └── urls.py           # Inventory endpoints
│   ├── 📁 orders/             # Orders app
│   │   ├── models.py         # Order & OrderItem models
│   │   ├── serializers.py    # Order serializers
│   │   ├── views.py          # Order API views
│   │   └── urls.py           # Order endpoints
│   ├── 📁 analytics/          # Analytics app
│   │   ├── models.py         # Analytics models
│   │   ├── views.py          # Analytics endpoints
│   │   └── urls.py           # Analytics routes
│   ├── manage.py             # Django management
│   ├── requirements.txt      # Python dependencies
│   └── db.sqlite3            # Development database
├── 📁 frontend/               # React frontend
│   ├── 📁 public/            # Static assets
│   ├── 📁 src/               # React source code
│   │   ├── 📁 components/    # React components
│   │   │   ├── Dashboard.js  # Main dashboard
│   │   │   ├── Inventory.js  # Inventory management
│   │   │   ├── Orders.js     # Order processing
│   │   │   ├── Analytics.js  # Analytics view
│   │   │   └── Layout.js     # App layout
│   │   ├── App.js           # Main App component
│   │   └── index.js         # React entry point
│   ├── package.json         # Node dependencies
│   └── package-lock.json    # Lock file
├── 📄 README.md             # This file
├── 📄 CALCULATION_PROCESS.md # Business logic documentation
└── 📁 .vscode/              # VS Code settings
```

## 🚀 Quick Start

### Prerequisites

- **Python 3.8+** with pip
- **Node.js 14+** with npm
- **Git** for version control

### 🔧 Backend Setup

1. **Clone and navigate to backend:**

```bash
git clone https://github.com/Mahajanashok2456/Inventory-manager.git
cd Inventory-manager/backend
```

2. **Create virtual environment (recommended):**

```bash
python -m venv venv
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate
```

3. **Install dependencies:**

```bash
pip install -r requirements.txt
```

4. **Setup database:**

```bash
python manage.py migrate
python manage.py createsuperuser  # Optional: Create admin user
```

5. **Start development server:**

```bash
python manage.py runserver
```

🚀 Backend running at: `http://127.0.0.1:8000/`

### ⚛️ Frontend Setup

1. **Navigate to frontend:**

```bash
cd ../frontend
```

2. **Install dependencies:**

```bash
npm install
```

3. **Start development server:**

```bash
npm start
```

🚀 Frontend running at: `http://localhost:3000/`

### 🌐 API Endpoints

The backend provides comprehensive REST API endpoints:

- **Products:** `GET/POST/PUT/DELETE /api/products/`
- **Categories:** `GET/POST/PUT/DELETE /api/categories/`
- **Orders:** `GET/POST/PUT/DELETE /api/orders/`
- **Order Items:** `GET/POST /api/order-items/`
- **Analytics:** `GET /api/analytics/dashboard/`

## 💼 Usage Guide

### 1. **Initial Setup**

1. Start both backend and frontend servers
2. Access the application at `http://localhost:3000`
3. Navigate to Inventory > Categories to create product categories
4. Add products with cost and selling prices

### 2. **Daily Operations**

1. **Recording Sales:** Use Orders section to create new orders
2. **Inventory Check:** Monitor stock levels in Inventory section
3. **Analytics:** Review performance metrics in Dashboard
4. **Stock Management:** Update quantities and prices as needed

### 3. **Key Workflows**

- **New Product:** Category → Product → Set Prices → Add Stock
- **Process Sale:** Orders → New Order → Add Items → Submit
- **Monitor Performance:** Dashboard → Review Metrics → Analyze Trends

## 🎯 Success Metrics

### Business Impact

- ✅ **100% Digital Tracking** - Eliminate manual inventory books
- ✅ **Real-time Accuracy** - Live stock and profit calculations
- ✅ **Time Savings** - 50%+ reduction in inventory management time
- ✅ **Data-Driven Decisions** - Analytics for better business insights

### Technical Achievements

- ✅ **Responsive Design** - Works on all devices
- ✅ **Modern Stack** - Latest Django and React versions
- ✅ **API-First** - RESTful backend architecture
- ✅ **Scalable Structure** - Modular Django apps

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**Ashok Mahajan** - [@mahajanashok2456](https://github.com/Mahajanashok2456)

- 📧 Email: ashokroshan78@gmail.com
- 🔗 GitHub: [Mahajan's Projects](https://github.com/Mahajanashok2456)

## 🙏 Acknowledgments

- Built with modern web technologies
- Inspired by real-world business needs
- Designed for scalability and maintainability

---

⭐ **Star this repository if you find it helpful!** ⭐

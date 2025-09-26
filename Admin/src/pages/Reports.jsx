import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import { API_BASE_URL } from '../../../src/config/api.js';

export default function Reports() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [salesData, setSalesData] = useState(null);
  const [topProducts, setTopProducts] = useState([]);

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setLoading(true);
        
        // Fetch orders and products data
        const [ordersResponse, productsResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/orders`),
          fetch(`${API_BASE_URL}/api/products`)
        ]);
        
        const orders = await ordersResponse.json();
        const products = await productsResponse.json();

        if (!ordersResponse.ok || !productsResponse.ok) {
          throw new Error('Failed to fetch report data');
        }

        // Process sales data by month
        const monthlySales = processMonthlySales(orders);
        
        // Calculate product sales from orders (not relying on salesCount field)
        const productSalesMap = {};
        orders.forEach(order => {
          if (order.status === 'Delivered' || order.status === 'Completed') {
            order.items?.forEach(item => {
              // Extract the product ID from the nested product object
              const productId = item.product?._id;
              if (productId) {
                productSalesMap[productId] = (productSalesMap[productId] || 0) + (item.quantity || 0);
              }
            });
          }
        });

        // Get top selling products
        const sortedProducts = [...products]
          .map(p => ({
            ...p,
            salesCount: productSalesMap[p._id] || 0
          }))
          .sort((a, b) => b.salesCount - a.salesCount)
          .slice(0, 3);

        setSalesData(monthlySales);
        setTopProducts(sortedProducts);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchReportData();
  }, []);

  // Process orders to get monthly sales data
  const processMonthlySales = (orders) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyTotals = Array(12).fill(0);
    
    // Only count delivered or completed orders
    const validOrders = orders.filter(order => 
      order.status === 'Delivered' || order.status === 'Completed'
    );
    
    validOrders.forEach(order => {
      const month = new Date(order.createdAt).getMonth();
      monthlyTotals[month] += order.total || order.totalPrice || 0;
    });
    
    // Get last 6 months of data
    const currentMonth = new Date().getMonth();
    const lastSixMonths = [];
    const labels = [];
    
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      lastSixMonths.push(monthlyTotals[monthIndex]);
      labels.push(months[monthIndex]);
    }
    
    return {
      labels,
      datasets: [{
        label: 'Sales',
        data: lastSixMonths,
        backgroundColor: 'rgba(54, 162, 235, 0.7)'
      }]
    };
  };

  const handleExport = (type) => {
    // In a real implementation, this would call your backend export API
    alert(`Exporting ${type} report...`);
    // Example: fetch(`/api/reports/export?type=${type}`);
  };

  if (loading) return <div className="card">Loading reports...</div>;
  if (error) return <div className="card error">{error}</div>;

  return (
    <div className="grid" style={{ gap: 16 }}>
      <div className="grid cols-2">
        <div className="card">
          <h3>Sales by Month</h3>
          {salesData ? (
            <Bar 
              data={salesData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    display: false
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: function(value) {
                        return '₹' + value.toLocaleString();
                      }
                    }
                  }
                }
              }}
            />
          ) : (
            <div>No sales data available</div>
          )}
        </div>
        <div className="card">
          <h3>Best-selling Products</h3>
          {topProducts.length > 0 ? (
            <ul style={{ listStyleType: 'none', padding: 0 }}>
              {topProducts.map((product, index) => (
                <li 
                  key={product._id} 
                  style={{ 
                    padding: '8px 0', 
                    borderBottom: '1px solid var(--border)',
                    display: 'flex',
                    justifyContent: 'space-between'
                  }}
                >
                  <span>{product.name}</span>
                  <span>{product.salesCount} units</span>
                </li>
              ))}
            </ul>
          ) : (
            <div>No product data available</div>
          )}
        </div>
      </div>
      <div className="card">
        <h3>Export Reports</h3>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button 
            className="btn ghost" 
            onClick={() => handleExport('sales')}
            disabled={loading}
          >
            Sales
          </button>
          <button 
            className="btn ghost" 
            onClick={() => handleExport('customers')}
            disabled={loading}
          >
            Customers
          </button>
          <button 
            className="btn ghost" 
            onClick={() => handleExport('coupons')}
            disabled={loading}
          >
            Coupons
          </button>
          <button 
            className="btn ghost" 
            onClick={() => handleExport('low-stock')}
            disabled={loading}
          >
            Low Stock
          </button>
        </div>
      </div>
    </div>
  );
}
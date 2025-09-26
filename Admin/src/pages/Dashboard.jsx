import React, { useState, useEffect } from 'react';
import { Line, Doughnut } from 'react-chartjs-2';
import 'chart.js/auto';
import { API_BASE_URL } from '../../../src/config/api.js';

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // ✅ Fetch products & orders directly from backend (MongoDB)
        const [productsRes, ordersRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/products`),
          fetch(`${API_BASE_URL}/api/orders`)
        ]);

        const products = await productsRes.json();
        const orders = await ordersRes.json();

        if (!productsRes.ok || !ordersRes.ok) {
          throw new Error('Failed to fetch dashboard data');
        }

        // Today's sales - include Completed and Delivered orders
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const salesToday = orders
          .filter(order => new Date(order.createdAt) >= today && 
                 (order.status === 'Delivered' || order.status === 'Completed'))
          .reduce((sum, order) => sum + (order.total || 0), 0);

        // Weekly sales (last 7 days) - include Completed and Delivered orders
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const weeklySales = orders
          .filter(order => new Date(order.createdAt) >= oneWeekAgo && 
                 (order.status === 'Delivered' || order.status === 'Completed'))
          .reduce((sum, order) => sum + (order.total || 0), 0);

        // Monthly sales (current month) - include Completed and Delivered orders
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        const monthlySales = orders
          .filter(order => new Date(order.createdAt) >= startOfMonth && 
                 (order.status === 'Delivered' || order.status === 'Completed'))
          .reduce((sum, order) => sum + (order.total || 0), 0);

        // Low stock count
        const lowStockCount = products.filter(p => (p.stock || 0) <= 10).length;

        // Completed orders count
        const completedOrdersCount = orders.filter(order => order.status === 'Completed').length;

        // Daily sales (for line chart) - include Completed and Delivered orders
        const dailySales = Array(7).fill(0);
        orders
          .filter(order => new Date(order.createdAt) >= oneWeekAgo && 
                 (order.status === 'Delivered' || order.status === 'Completed'))
          .forEach(order => {
            const day = new Date(order.createdAt).getDay(); // 0=Sun → 6=Sat
            const adjustedDay = day === 0 ? 6 : day - 1;   // Make Mon first
            dailySales[adjustedDay] += order.total || 0;
          });

        // Order status counts (for doughnut chart)
        const statusCounts = {};
        orders.forEach(order => {
          const status = order.status || "Unknown";
          statusCounts[status] = (statusCounts[status] || 0) + 1;
        });

       // In your useEffect, replace the product sales counting logic:

// Top selling products (by salesCount field or fallback = orders count)
const productSalesMap = {};
orders.forEach(order => {
  // Only count delivered or completed orders
  if (order.status === 'Delivered' || order.status === 'Completed') {
    order.items?.forEach(item => {
      // Use the correct property name for product ID
      const productId = item.product?._id;
      if (productId) {
        productSalesMap[productId] = (productSalesMap[productId] || 0) + (item.quantity || 0);
      }
    });
  }
});

const topSellingProducts = [...products]
  .map(p => ({
    ...p,
    totalSold: productSalesMap[p._id] || 0
  }))
  .sort((a, b) => b.totalSold - a.totalSold)
  .slice(0, 5);
  
        // Recent orders - include all statuses
        const recentOrders = [...orders]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5);

        // ✅ Set final dashboard data
        setDashboardData({
          stats: { salesToday, weeklySales, monthlySales, lowStockCount, completedOrdersCount },
          lineData: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{ data: dailySales }]
          },
          doughnutData: {
            labels: Object.keys(statusCounts),
            datasets: [{ data: Object.values(statusCounts) }]
          },
          topSellingProducts,
          recentOrders
        });

        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <div className="card">Loading dashboard data...</div>;
  if (error) return <div className="card error">{error}</div>;
  if (!dashboardData) return <div className="card">No data available</div>;

  return (
    <div className="grid" style={{ gap: 16 }}>
      {/* 📌 STATS */}
      <div className="grid cols-5">
        <div className="card">
          <h3>Sales Today</h3>
          <div style={{ fontSize: 28, fontWeight: 800 }}>
            ₹{dashboardData.stats.salesToday.toLocaleString()}
          </div>
        </div>
        <div className="card">
          <h3>Weekly</h3>
          <div style={{ fontSize: 28, fontWeight: 800 }}>
            ₹{dashboardData.stats.weeklySales.toLocaleString()}
          </div>
        </div>
        <div className="card">
          <h3>Monthly</h3>
          <div style={{ fontSize: 28, fontWeight: 800 }}>
            ₹{dashboardData.stats.monthlySales.toLocaleString()}
          </div>
        </div>
        <div className="card">
          <h3>Low Stock</h3>
          <div style={{ fontSize: 28, fontWeight: 800 }}>
            {dashboardData.stats.lowStockCount}
          </div>
        </div>
        <div className="card">
          <h3>Completed Orders</h3>
          <div style={{ fontSize: 28, fontWeight: 800 }}>
            {dashboardData.stats.completedOrdersCount}
          </div>
        </div>
      </div>

      {/* 📈 CHARTS */}
      <div className="grid cols-2">
        <div className="card">
          <h3>Sales This Week</h3>
          <Line 
            data={{
              labels: dashboardData.lineData.labels,
              datasets: [{
                ...dashboardData.lineData.datasets[0],
                label: 'Sales',
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
              }]
            }} 
          />
        </div>
        <div className="card">
          <h3>Orders by Status</h3>
          <Doughnut 
            data={{
              labels: dashboardData.doughnutData.labels,
              datasets: [{
                ...dashboardData.doughnutData.datasets[0],
                backgroundColor: [
                  'rgba(255, 99, 132, 0.7)',
                  'rgba(54, 162, 235, 0.7)',
                  'rgba(255, 206, 86, 0.7)',
                  'rgba(75, 192, 192, 0.7)',
                  'rgba(153, 102, 255, 0.7)',
                  'rgba(46, 125, 50, 0.7)', // Completed
                  'rgba(244, 67, 54, 0.7)'  // Cancelled/Refunded
                ]
              }]
            }} 
          />
        </div>
      </div>

      {/* 📦 TOP PRODUCTS + RECENT ORDERS */}
      <div className="grid cols-2">
        <div className="card">
          <h3>Top-selling Products</h3>
          <ul>
            {dashboardData.topSellingProducts.map(p => (
              <li 
                key={p._id} 
                style={{
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  padding: '8px 0', 
                  borderBottom: '1px solid var(--border)'
                }}
              >
                <span>{p.name}</span>
                <span>Sold: {p.totalSold}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="card">
          <h3>Recent Orders</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Status</th>
                  <th>Total</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.recentOrders.map(o => (
                  <tr key={o._id}>
                    <td>{o._id.substring(0, 8)}...</td>
                    <td>{o.customer?.name || o.customer?.email || 'Guest'}</td>
                    <td>
                      <span className={`status-badge status-${o.status.toLowerCase()}`}>
                        {o.status}
                      </span>
                    </td>
                    <td>₹{o.total}</td>
                    <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
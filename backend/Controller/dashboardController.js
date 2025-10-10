import Order from "../Models/orderModel.js";
import Product from "../Models/productModel.js";

// Get dashboard data (no authentication required)
export const getDashboardData = async (req, res) => {
  try {
    const [products, orders] = await Promise.all([
      Product.find(),
      Order.find().populate("items.product", "name price")
    ]);

    // Today's sales
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const salesToday = orders
      .filter(order => new Date(order.createdAt) >= today && 
             (order.status === 'Delivered' || order.status === 'Completed'))
      .reduce((sum, order) => sum + (order.total || 0), 0);

    // Weekly sales
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const weeklySales = orders
      .filter(order => new Date(order.createdAt) >= oneWeekAgo && 
             (order.status === 'Delivered' || order.status === 'Completed'))
      .reduce((sum, order) => sum + (order.total || 0), 0);

    // Monthly sales
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

    // Daily sales data
    const dailySales = Array(7).fill(0);
    orders
      .filter(order => new Date(order.createdAt) >= oneWeekAgo && 
             (order.status === 'Delivered' || order.status === 'Completed'))
      .forEach(order => {
        const day = new Date(order.createdAt).getDay();
        const adjustedDay = day === 0 ? 6 : day - 1;
        dailySales[adjustedDay] += order.total || 0;
      });

    // Order status counts
    const statusCounts = {};
    orders.forEach(order => {
      const status = order.status || "Unknown";
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    // Top selling products
    const productSalesMap = {};
    orders.forEach(order => {
      if (order.status === 'Delivered' || order.status === 'Completed') {
        order.items?.forEach(item => {
          const productId = item.product?._id;
          if (productId) {
            productSalesMap[productId] = (productSalesMap[productId] || 0) + (item.quantity || 0);
          }
        });
      }
    });

    const topSellingProducts = [...products]
      .map(p => ({
        ...p._doc,
        totalSold: productSalesMap[p._id] || 0
      }))
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, 5);

    // Recent orders
    const recentOrders = [...orders]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    res.json({
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

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get report data
export const getReportData = async (req, res) => {
  try {
    const [products, orders] = await Promise.all([
      Product.find(),
      Order.find().populate("items.product", "name price")
    ]);

    // Process monthly sales
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyTotals = Array(12).fill(0);
    
    const validOrders = orders.filter(order => 
      order.status === 'Delivered' || order.status === 'Completed'
    );
    
    validOrders.forEach(order => {
      const month = new Date(order.createdAt).getMonth();
      monthlyTotals[month] += order.total || 0;
    });
    
    const currentMonth = new Date().getMonth();
    const lastSixMonths = [];
    const labels = [];
    
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      lastSixMonths.push(monthlyTotals[monthIndex]);
      labels.push(months[monthIndex]);
    }

    // Top products
    const productSalesMap = {};
    orders.forEach(order => {
      if (order.status === 'Delivered' || order.status === 'Completed') {
        order.items?.forEach(item => {
          const productId = item.product?._id;
          if (productId) {
            productSalesMap[productId] = (productSalesMap[productId] || 0) + (item.quantity || 0);
          }
        });
      }
    });

    const topProducts = [...products]
      .map(p => ({
        ...p._doc,
        salesCount: productSalesMap[p._id] || 0
      }))
      .sort((a, b) => b.salesCount - a.salesCount)
      .slice(0, 3);

    res.json({
      salesData: {
        labels,
        datasets: [{
          label: 'Sales',
          data: lastSixMonths,
          backgroundColor: 'rgba(54, 162, 235, 0.7)'
        }]
      },
      topProducts
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
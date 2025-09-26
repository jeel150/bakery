import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Select,
  MenuItem,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { API_BASE_URL } from '../../../src/config/api.js';

const StatusChip = styled(Chip)(({ status }) => ({
  backgroundColor: 
    status === 'Delivered' ? '#4caf50' :
    status === 'Processing' ? '#2196f3' :
    status === 'Shipped' ? '#ff9800' :
    status === 'Cancelled' || status === 'Refunded' ? '#f44336' :
    '#9e9e9e',
  color: 'white',
  fontWeight: 'bold'
}));

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [trackingDialog, setTrackingDialog] = useState({ open: false, order: null, trackingNumber: '' });

  const statuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Refunded'];

  // Fetch all orders
  const fetchOrders = async () => {
    try {
      setLoading(true);
      let url = `${API_BASE_URL}/api/orders`;
      const params = new URLSearchParams();
      
      if (statusFilter) params.append('status', statusFilter);
      if (dateFilter) params.append('date', dateFilter);
      
      if (params.toString()) url += `?${params.toString()}`;
      
      const res = await fetch(url);
      const data = await res.json();
      setOrders(data);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch orders");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, dateFilter]);

  // Update order status
  const updateStatus = async (orderId, newStatus, trackingNumber = null) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, trackingNumber }),
      });
      
      if (!response.ok) throw new Error("Failed to update status");
      
      setSuccess(`Order status updated to ${newStatus} successfully!`);
      fetchOrders();
      setTrackingDialog({ open: false, order: null, trackingNumber: '' });
    } catch (err) {
      setError("Error updating order status");
    } finally {
      setLoading(false);
    }
  };

  // Process refund
  const processRefund = async (orderId) => {
    if (!window.confirm("Are you sure you want to process a refund for this order?")) return;
    
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}/refund`, {
        method: "POST",
      });
      
      if (!response.ok) throw new Error("Failed to process refund");
      
      setSuccess("Refund processed successfully!");
      fetchOrders();
    } catch (err) {
      setError("Error processing refund");
    } finally {
      setLoading(false);
    }
  };

  // Open tracking dialog
  const openTrackingDialog = (order) => {
    setTrackingDialog({
      open: true,
      order: order,
      trackingNumber: order.trackingNumber || ''
    });
  };

  // Close tracking dialog
  const closeTrackingDialog = () => {
    setTrackingDialog({ open: false, order: null, trackingNumber: '' });
  };

  // Handle tracking number change
  const handleTrackingNumberChange = (e) => {
    setTrackingDialog({
      ...trackingDialog,
      trackingNumber: e.target.value
    });
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Admin - Manage Orders</h2>

      {error && <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>}
      {success && <Alert severity="success" onClose={() => setSuccess(null)}>{success}</Alert>}

      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        <div style={{ flex: 1 }}>
          <TextField
            select
            label="Filter by Status"
            fullWidth
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            {statuses.map((status) => (
              <MenuItem key={status} value={status}>{status}</MenuItem>
            ))}
          </TextField>
        </div>
        <div style={{ flex: 1 }}>
          <TextField
            label="Filter by Date"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <CircularProgress />
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Order ID</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Items</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order._id}>
                  <TableCell>{order._id.substring(0, 8)}...</TableCell>
                  <TableCell>
                    <div>
                      <strong>{order.customer?.name}</strong>
                      <div>{order.customer?.email}</div>
                      <div>{order.customer?.phone}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {order.items.map((item, index) => (
                      <div key={index}>
                        {item.name} (x{item.quantity}) - ₹{item.price}
                      </div>
                    ))}
                  </TableCell>
                  <TableCell>₹{order.total}</TableCell>
                  <TableCell>
                    <StatusChip 
                      label={order.status} 
                      status={order.status}
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>
                    {formatDate(order.createdAt)}
                  </TableCell>
                  <TableCell>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {order.status === 'Pending' && (
                        <Button 
                          variant="contained" 
                          color="primary" 
                          size="small"
                          onClick={() => updateStatus(order._id, 'Processing')}
                          disabled={loading}
                        >
                          Confirm Order
                        </Button>
                      )}
                      
                      {order.status === 'Processing' && (
                        <Button 
                          variant="contained" 
                          color="warning" 
                          size="small"
                          onClick={() => updateStatus(order._id, 'Shipped')}
                          disabled={loading}
                        >
                          Mark as Shipped
                        </Button>
                      )}
                      
                      {order.status === 'Shipped' && (
                        <Button 
                          variant="contained" 
                          color="success" 
                          size="small"
                          onClick={() => updateStatus(order._id, 'Delivered')}
                          disabled={loading}
                        >
                          Mark as Delivered
                        </Button>
                      )}
                      
                      {(order.status === 'Pending' || order.status === 'Processing') && (
                        <Button 
                          variant="outlined" 
                          color="error" 
                          size="small"
                          onClick={() => updateStatus(order._id, 'Cancelled')}
                          disabled={loading}
                        >
                          Cancel Order
                        </Button>
                      )}
                      
                      {(order.status === 'Delivered' || order.status === 'Shipped') && (
                        <Button 
                          variant="outlined" 
                          color="error" 
                          size="small"
                          onClick={() => processRefund(order._id)}
                          disabled={loading || order.status === 'Refunded'}
                        >
                          Process Refund
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Tracking Dialog */}
      <Dialog open={trackingDialog.open} onClose={closeTrackingDialog}>
        <DialogTitle>Update Tracking Number</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Tracking Number"
            fullWidth
            variant="outlined"
            value={trackingDialog.trackingNumber}
            onChange={handleTrackingNumberChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeTrackingDialog}>Cancel</Button>
          <Button 
            onClick={() => updateStatus(
              trackingDialog.order._id, 
              trackingDialog.order.status,
              trackingDialog.trackingNumber
            )}
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
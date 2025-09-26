import React, { useState, useEffect } from 'react'
import DataTable from '../components/DataTable.jsx'
import Modal from '../components/Modal.jsx'
import { API_BASE_URL } from '../../../src/config/api.js';
export default function Inventory() {
  const [rows, setRows] = useState([])
  const [logs, setLogs] = useState([])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ productId: '', change: 0, reason: '' })
  const [loading, setLoading] = useState(true)

  // ✅ Fetch products
  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/products`)
      const data = await res.json()
      setRows(data)
    } catch (err) {
      console.error("Error fetching products:", err)
    } finally {
      setLoading(false)
    }
  }

  // ✅ Fetch delivered orders and add logs
  const fetchOrderLogs = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders`)
      if (!res.ok) return
      const orders = await res.json()

      const deliveredLogs = []
      orders.forEach(order => {
        if (order.status === "delivered" && order.items) {
          order.items.forEach(item => {
            deliveredLogs.push({
              id: `${order._id}-${item.productId}`,
              product: item.name,
              change: -item.quantity,
              reason: "Delivered Order",
              date: new Date(order.updatedAt || order.createdAt).toISOString().slice(0, 10),
              updatedStock: item.updatedStock ?? "N/A"
            })
          })
        }
      })

      setLogs(ls => [...deliveredLogs, ...ls])
    } catch (err) {
      console.error("Error fetching orders:", err)
    }
  }

  useEffect(() => {
    fetchProducts()
    fetchOrderLogs()
    const interval = setInterval(fetchProducts, 10000)
    return () => clearInterval(interval)
  }, [])

  const lowStock = rows.filter(r => r.stock <= 2)

  const onAdjust = async () => {
    const id = form.productId
    if (!id || !form.change) return alert('Select product and enter quantity change')

    try {
      const res = await fetch(`${API_BASE_URL}/api/products/${id}/adjust`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ change: Number(form.change), reason: form.reason })
      })

      if (!res.ok) throw new Error("Failed to update stock")
      const updatedProduct = await res.json()

      setRows(rs => rs.map(r => r._id === updatedProduct._id ? updatedProduct : r))

      setLogs(ls => [
        {
          id: Date.now(),
          product: updatedProduct.name,
          change: Number(form.change),
          reason: form.reason || "Manual Adjustment",
          date: new Date().toISOString().slice(0, 10),
          updatedStock: updatedProduct.stock
        },
        ...ls
      ])

      setOpen(false)
    } catch (err) {
      console.error(err)
      alert("Error adjusting stock")
    }
  }

  const onBulk = () => alert('CSV Import/Export simulated')

  return (
    <div className="grid" style={{ gap: 16 }}>
      <div className="grid cols-2">
        <div className="card">
          <h3>Stock Levels</h3>
          {loading ? (
            <p>Loading products...</p>
          ) : (
            <DataTable
              columns={[
                { key: '_id', label: 'ID' },
                { key: 'name', label: 'Product' },
                { 
                  key: 'stock', 
                  label: 'Stock',
                  render: (val) => (
                    val < 1 
                      ? <span style={{ color: 'red', fontWeight: 'bold' }}>Out of Stock</span>
                      : val <= 2 
                        ? <span style={{ color: 'red' }}>{val}</span> 
                        : val
                  )
                },
                { key: 'category', label: 'Category' },
              ]}
              data={rows}
            />
          )}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button className="btn ghost" onClick={onBulk}>
              <i className="fa-solid fa-file-csv"></i> Bulk CSV
            </button>
            <button className="btn" onClick={() => setOpen(true)}>
              <i className="fa-solid fa-plus-minus"></i> Adjust Stock
            </button>
          </div>
        </div>

        <div className="card">
          <h3>Low Stock Alerts</h3>
          <ul>
            {lowStock.length ? lowStock.map(p => (
              <li key={p._id} style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                {p.name} — {p.stock < 1 
                  ? <span style={{ color: 'red', fontWeight: 'bold' }}>Out of Stock</span>
                  : <span style={{ color: 'red' }}>{p.stock} left</span>}
              </li>
            )) : <li>None</li>}
          </ul>

          <h3 style={{ marginTop: 16 }}>Stock Adjustment Logs</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Product</th>
                  <th>Change</th>
                  <th>Reason</th>
                  <th>Date</th>
                  <th>Updated Stock</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(l => (
                  <tr key={l.id}>
                    <td>{l.id}</td>
                    <td>{l.product}</td>
                    <td style={{ color: l.change < 0 ? 'red' : 'green' }}>{l.change}</td>
                    <td>{l.reason}</td>
                    <td>{l.date}</td>
                    <td>{l.updatedStock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Adjust Stock"
        footer={
          <>
            <button className="btn ghost" onClick={() => setOpen(false)}>Cancel</button>
            <button className="btn" onClick={onAdjust}>Save</button>
          </>
        }
      >
        <div className="grid responsive">
          <div>
            <label className="label">Product</label>
            <select
              className="select"
              value={form.productId}
              onChange={e => setForm({ ...form, productId: e.target.value })}
            >
              <option value="">Select product</option>
              {rows.map(r => <option key={r._id} value={r._id}>{r.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Change (+/-)</label>
            <input
              type="number"
              className="input"
              value={form.change}
              onChange={e => setForm({ ...form, change: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Reason</label>
            <input
              className="input"
              value={form.reason}
              onChange={e => setForm({ ...form, reason: e.target.value })}
            />
          </div>
        </div>
      </Modal>
    </div>
  )
}

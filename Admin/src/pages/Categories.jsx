import { useState, useEffect } from "react";
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  TextField, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, IconButton, Typography, Snackbar, Alert
} from "@mui/material";
import { Add, Edit, Delete } from "@mui/icons-material";
import { API_BASE_URL } from '../../../src/config/api.js';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "" });
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const API_BASE = `${API_BASE_URL}/api/categories`;

  // ✅ Fetch Categories
  const fetchCategories = async () => {
    try {
      const res = await fetch(API_BASE);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error(err);
      showSnackbar("❌ Failed to load categories", "error");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  // ✅ Save Category
  const onSave = async () => {
    if (!form.name.trim()) {
      showSnackbar("⚠️ Please enter category name", "warning");
      return;
    }

    try {
      const res = await fetch(
        editing ? `${API_BASE}/${editing._id}` : API_BASE,
        {
          method: editing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: form.name }),
        }
      );

      if (!res.ok) throw new Error("Failed to save");
      fetchCategories();
      setOpen(false);
      showSnackbar(editing ? "✅ Category updated" : "✅ Category added");
    } catch (err) {
      console.error(err);
      showSnackbar("❌ Failed to save category", "error");
    }
  };

  // ✅ Delete Category
  const onDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    try {
      const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      fetchCategories();
      showSnackbar("🗑️ Category deleted");
    } catch (err) {
      console.error(err);
      showSnackbar("❌ Failed to delete category", "error");
    }
  };

  return (
    <Box p={3}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={600}>Category Management</Typography>
        <Button startIcon={<Add />} variant="contained" onClick={() => { setEditing(null); setForm({ name: "" }); setOpen(true); }}>
          Add Category
        </Button>
      </Box>

      {/* Table */}
      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead sx={{ background: "#f5f5f5" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Category Name</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} align="center" sx={{ py: 3 }}>
                  <Typography color="textSecondary">No categories yet</Typography>
                </TableCell>
              </TableRow>
            ) : (
              categories.map(c => (
                <TableRow key={c._id} hover>
                  <TableCell>{c.name}</TableCell>
                  <TableCell>
                    <IconButton color="primary" onClick={() => { setEditing(c); setForm({ name: c.name }); setOpen(true); }}><Edit /></IconButton>
                    <IconButton color="error" onClick={() => onDelete(c._id)}><Delete /></IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>{editing ? "Edit Category" : "Add Category"}</DialogTitle>
        <DialogContent>
          <TextField label="Category Name *" fullWidth value={form.name} onChange={e => setForm({ name: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={onSave} variant="contained">{editing ? "Update" : "Add"}</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}

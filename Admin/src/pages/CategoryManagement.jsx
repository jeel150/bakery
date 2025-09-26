import { useState, useEffect } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Snackbar,
  Alert,
  Box,
  Typography,
  CircularProgress,
} from "@mui/material";
import { Add, Edit, Delete } from "@mui/icons-material";
import axios from "axios";
import { API_BASE_URL } from '../../../src/config/api.js';

export default function CategoryManagement() {
  const API_BASE = `${API_BASE_URL}/api/categories`; ;

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", sections: [] });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const showSnackbar = (msg, severity = "success") =>
    setSnackbar({ open: true, message: msg, severity });

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_BASE);
      setCategories(res.data);
    } catch (err) {
      console.error(err);
      showSnackbar("Failed to fetch categories", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSave = async () => {
    if (!form.name || form.sections.length === 0) {
      showSnackbar("Please fill all fields", "warning");
      return;
    }

    try {
      if (editing) {
        await axios.put(`${API_BASE}/${editing._id}`, form);
        showSnackbar("Category updated!");
      } else {
        await axios.post(API_BASE, form);
        showSnackbar("Category added!");
      }
      fetchCategories();
      setOpen(false);
    } catch (err) {
      console.error(err);
      showSnackbar(
        err.response?.data?.message || "Error saving category",
        "error"
      );
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this category?")) return;
    try {
      await axios.delete(`${API_BASE}/${id}`);
      showSnackbar("Category deleted");
      fetchCategories();
    } catch (err) {
      console.error(err);
      showSnackbar("Error deleting category", "error");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={600}>
          Category Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => {
            setEditing(null);
            setForm({ name: "", sections: [] });
            setOpen(true);
          }}
        >
          Add Category
        </Button>
      </Box>

      {/* Table */}
      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead sx={{ background: "#f5f5f5" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Sections</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    No categories found
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((c) => (
                  <TableRow key={c._id}>
                    <TableCell>{c.name}</TableCell>
                    <TableCell>{c.sections?.join(", ")}</TableCell>
                    <TableCell>
                      <IconButton
                        color="primary"
                        onClick={() => {
                          setEditing(c);
                          setForm({ name: c.name, sections: c.sections });
                          setOpen(true);
                        }}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(c._id)}
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>{editing ? "Edit Category" : "Add Category"}</DialogTitle>
        <DialogContent>
          <TextField
            label="Category Name"
            fullWidth
            margin="dense"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Sections</InputLabel>
            <Select
              multiple
              value={form.sections}
              onChange={(e) => setForm({ ...form, sections: e.target.value })}
            >
              <MenuItem value="sweet-story">Sweet Story</MenuItem>
              <MenuItem value="mini-bites">Mini Bites</MenuItem>
              <MenuItem value="occasion">Occasion</MenuItem>
              <MenuItem value="addon">addon</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            {editing ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </div>
  );
}

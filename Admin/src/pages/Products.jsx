import { useState, useEffect } from 'react';
import {
  Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  IconButton, MenuItem, Box, Typography, Grid, Chip, ToggleButton, ToggleButtonGroup,
  FormControl, InputLabel, Select, CircularProgress, Alert, Snackbar
} from '@mui/material';
import { Add, Edit, Delete, CloudUpload, Inventory, AttachMoney, Scale } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { API_BASE_URL } from '../../../src/config/api.js';


// Styled components
const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const UploadButton = styled(Button)({
  marginTop: '16px',
  marginBottom: '8px',
  padding: '10px 16px',
  border: '2px dashed #ccc',
  borderRadius: '8px',
  textTransform: 'none',
  justifyContent: 'center',
  width: '100%',
  '&:hover': {
    border: '2px dashed #1976d2',
    backgroundColor: 'rgba(25, 118, 210, 0.04)',
  },
});

const FormSection = styled(Box)({
  marginBottom: '20px',
  padding: '16px',
  borderRadius: '8px',
  backgroundColor: '#f9f9f9',
  border: '1px solid #e0e0e0',
});

const ProductImage = styled('img')({
  maxWidth: '100%',
  maxHeight: '200px',
  borderRadius: '8px',
  border: '1px solid #e0e0e0',
});

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]); // ✅ dynamic categories
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image: '',
    stock: 0,
    weight: '',
    customWeight: '',
    eggType: 'egg',
  });

  const API_BASE = `${API_BASE_URL}/api/products`;
  const CATEGORY_API = `${API_BASE_URL}/api/categories`;

  const weightOptions = ['500g', '1kg', '2kg', '5kg', 'custom'];

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  // ✅ Fetch products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_BASE);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error("Error fetching products:", err);
      showSnackbar("❌ Failed to fetch products", "error");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch categories
  const fetchCategories = async () => {
    try {
      const res = await fetch(CATEGORY_API);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error("Error fetching categories:", err);
      showSnackbar("❌ Failed to fetch categories", "error");
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // ✅ Add / Edit
  const onSave = async () => {
    if (!form.name || !form.price || !form.category || !form.image) {
      showSnackbar("⚠️ Please fill required fields", "warning");
      return;
    }

    try {
      const payload = {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        category: form.category,
        image: form.image,
        stock: Number(form.stock),
        weight: form.weight,
        customWeight: form.customWeight,
        eggType: form.eggType,
      };

      const res = await fetch(
        editing ? `${API_BASE}/${editing._id}` : API_BASE,
        {
          method: editing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Request failed");
      }

      await fetchProducts();
      setOpen(false);
      showSnackbar(editing ? "✅ Product updated!" : "✅ Product added!");
    } catch (err) {
      console.error("Error saving product:", err);
      showSnackbar(`❌ ${err.message}`, "error");
    }
  };

  // ✅ Delete
  const onDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Delete failed");
      }

      const data = await res.json().catch(() => ({}));
      showSnackbar(data.message || "🗑️ Product deleted");
      fetchProducts();
    } catch (err) {
      console.error("Error deleting product:", err);
      showSnackbar(`❌ ${err.message}`, "error");
    }
  };

  const openAddDialog = () => {
    setEditing(null);
    setForm({ name: '', description: '', price: '', category: '', image: '', stock: 0, weight: '', customWeight: '', eggType: 'egg' });
    setOpen(true);
  };

  const openEditDialog = (p) => {
    setEditing(p);
    setForm({
      name: p.name,
      description: p.description,
      price: p.price,
      category: p.category,
      image: p.image,
      stock: p.stock,
      weight: p.weight,
      customWeight: p.customWeight,
      eggType: p.eggType,
    });
    setOpen(true);
  };

  const handleWeightChange = (e) => {
    const value = e.target.value;
    setForm({ ...form, weight: value, customWeight: value === "custom" ? form.customWeight : "" });
  };

const handleImageUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  setUploading(true);
  try {
    const formData = new FormData();
    formData.append("image", file);

    const res = await fetch(`${API_BASE_URL}/api/upload`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) throw new Error("Failed to upload image");
    const data = await res.json();

    // ✅ Save Cloudinary URL into form
    setForm({ ...form, image: data.url });
    showSnackbar("✅ Image uploaded!");
  } catch (err) {
    console.error(err);
    showSnackbar("❌ Error uploading image", "error");
  } finally {
    setUploading(false);
  }
};

  const getDisplayWeight = (p) => (p.weight === "custom" && p.customWeight ? p.customWeight : p.weight || "N/A");

  return (
    <div style={{ padding: 20 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={600}>Product Management</Typography>
        <Button startIcon={<Add />} variant="contained" onClick={openAddDialog} sx={{ borderRadius: 2, px: 3 }}>
          Add New Product
        </Button>
      </Box>

      {/* Loading */}
      {loading && <Box display="flex" justifyContent="center" my={4}><CircularProgress /></Box>}

      {/* Table */}
      {!loading && (
        <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead sx={{ background: "#f5f5f5" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Product</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Weight</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Egg/Eggless</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Price</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Stock</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography color="textSecondary">No products found. Add your first product!</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                products.map(p => (
                  <TableRow key={p._id} hover>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        {p.image && <img src={p.image} alt={p.name} width={50} height={50} style={{ borderRadius: 8, marginRight: 12, objectFit: "cover" }} />}
                        <Box>
                          <Typography fontWeight={500}>{p.name}</Typography>
                          <Typography variant="body2" color="textSecondary" sx={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                            {p.description}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell><Chip label={p.category} size="small" color="primary" variant="outlined" /></TableCell>
                    <TableCell><Box display="flex" alignItems="center"><Scale fontSize="small" sx={{ mr: 0.5 }} /><Typography>{getDisplayWeight(p)}</Typography></Box></TableCell>
                    <TableCell><Chip label={p.eggType === "egg" ? "With Egg" : "Eggless"} size="small" color={p.eggType === "egg" ? "primary" : "success"} variant="outlined" /></TableCell>
                    <TableCell><Box display="flex" alignItems="center"><AttachMoney fontSize="small" sx={{ mr: 0.5 }} /><Typography>₹{p.price}</Typography></Box></TableCell>
                    <TableCell><Box display="flex" alignItems="center"><Inventory fontSize="small" sx={{ mr: 0.5, color: p.stock > 0 ? "green" : "error.main" }} /><Typography color={p.stock > 0 ? "inherit" : "error"}>{p.stock}</Typography></Box></TableCell>
                    <TableCell>
                      <IconButton color="primary" onClick={() => openEditDialog(p)} sx={{ mr: 1 }}><Edit /></IconButton>
                      <IconButton color="error" onClick={() => onDelete(p._id)}><Delete /></IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
        <DialogTitle sx={{ background: "primary.main", color: "white", fontWeight: 600 }}>{editing ? "Edit Product" : "Add Product"}</DialogTitle>
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormSection>
                <TextField label="Product Name *" fullWidth required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} sx={{ mb: 2 }} />
                <TextField label="Description" fullWidth multiline rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} sx={{ mb: 2 }} />

                {/* ✅ Dynamic Category Dropdown */}
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Category *</InputLabel>
                  <Select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                    {categories.map(c => (
                      <MenuItem key={c._id} value={c.name}>{c.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={6}>
                    <FormControl fullWidth>
                      <InputLabel>Weight</InputLabel>
                      <Select value={form.weight} onChange={handleWeightChange}>
                        {weightOptions.map(w => <MenuItem key={w} value={w}>{w}</MenuItem>)}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={6}>
                    {form.weight === "custom" && (
                      <TextField label="Custom Weight" fullWidth value={form.customWeight} onChange={e => setForm({ ...form, customWeight: e.target.value })} />
                    )}
                  </Grid>
                </Grid>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2">Egg Type</Typography>
                  <ToggleButtonGroup value={form.eggType} exclusive onChange={(e, v) => v && setForm({ ...form, eggType: v })} fullWidth>
                    <ToggleButton value="egg">With Egg</ToggleButton>
                    <ToggleButton value="eggless">Eggless</ToggleButton>
                  </ToggleButtonGroup>
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField label="Price *" type="number" fullWidth required value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField label="Stock *" type="number" fullWidth required value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} />
                  </Grid>
                </Grid>
              </FormSection>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormSection>
                <UploadButton component="label" disabled={uploading} startIcon={<CloudUpload />}>
                  {uploading ? "Uploading..." : "Choose Image"}
                  <VisuallyHiddenInput type="file" accept="image/*" onChange={handleImageUpload} />
                </UploadButton>
                <TextField label="Or enter image URL *" fullWidth value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} sx={{ mt: 2 }} />
                {form.image && <Box mt={2} textAlign="center"><ProductImage src={form.image} alt="Preview" onError={e => (e.target.style.display = "none")} /></Box>}
              </FormSection>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={onSave} variant="contained" disabled={uploading}>{editing ? "Update" : "Add"}</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
        <Alert severity={snackbar.severity} sx={{ width: "100%" }}>{snackbar.message}</Alert>
      </Snackbar>
    </div>
  );
}

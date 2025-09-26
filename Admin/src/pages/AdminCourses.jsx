// AdminCourses.jsx
import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../../src/config/api.js';

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  MenuItem,
  Box,
  Typography,
  Grid,
  Chip,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import { Add, Edit, Delete, CloudUpload } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
const FormSection = styled(Box)({
  marginBottom: '20px',
  padding: '16px',
  borderRadius: '8px',
  backgroundColor: '#f9f9f9',
  border: '1px solid #e0e0e0'
});

const CourseImage = styled('img')({
  maxWidth: '100%',
  maxHeight: '200px',
  borderRadius: '8px',
  border: '1px solid #e0e0e0'
});

export default function AdminCourses() {
  const [courses, setCourses] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [uploading] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    buttonText: 'View Course ➜',
    image: '',
    label: '',
    days: '',
    category: ''
  });

  // Category options
  const categories = [
    'BASIC',
    'INTERMEDIATE',
    'ADVANCED',
    'WORKSHOPS',
    'KIDS WORKSHOPS'
  ];

  // Fetch all courses
  const fetchCourses = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/courses`);
      const data = await res.json();
      setCourses(data);
    } catch (err) {
      console.error("Error fetching courses:", err);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // Open Add Dialog
  const openAddDialog = () => {
    setEditing(null);
    setForm({ 
      title: '',
      description: '',
      buttonText: 'View Course ➜',
      image: '',
      label: '',
      days: '',
      category: ''
    });
    setOpen(true);
  };

  // Open Edit Dialog
  const openEditDialog = (course) => {
    setEditing(course);
    setForm({
      title: course.title,
      description: course.description,
      buttonText: course.buttonText,
      image: course.image,
      label: course.label,
      days: course.days,
      category: course.category
    });
    setOpen(true);
  };


  // Save (Add or Edit)
  const onSave = async () => {
    if (!form.title || !form.description || !form.image || !form.label || !form.days || !form.category) {
      alert("Please fill all required fields");
      return;
    }
    
    try {
      let res;
      const payload = { ...form };

      if (editing) {
        // Update existing course
        res = await fetch(`${API_BASE_URL}/api/courses/${editing._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        // Add new course
        res = await fetch(`${API_BASE_URL}/api/courses`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) throw new Error("Request failed");
      await fetchCourses();
      setOpen(false);
      alert(editing ? "✅ Course updated!" : "✅ Course added!");
    } catch (err) {
      console.error("Error saving course:", err);
      alert("❌ Error saving course. Check console.");
    }
  };

  // Delete Course
  const onDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/courses/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");
      alert("🗑️ Course deleted");
      fetchCourses();
    } catch (err) {
      console.error("Error deleting course:", err);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="600">
          Course Management
        </Typography>
        <Button
          startIcon={<Add />}
          variant="contained"
          onClick={openAddDialog}
          sx={{ borderRadius: '8px', padding: '10px 20px' }}
        >
          Add New Course
        </Button>
      </Box>

      {/* Course List Table */}
      <TableContainer component={Paper} elevation={3} sx={{ borderRadius: '8px' }}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: '600' }}>Course</TableCell>
              <TableCell sx={{ fontWeight: '600' }}>Category</TableCell>
              <TableCell sx={{ fontWeight: '600' }}>Label</TableCell>
              <TableCell sx={{ fontWeight: '600' }}>Duration</TableCell>
              <TableCell sx={{ fontWeight: '600' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {courses.map((c) => (
              <TableRow key={c._id} hover>
                <TableCell>
                  <Box display="flex" alignItems="center">
                    {c.image && (
                      <img src={c.image} alt={c.title} width="50" height="50" style={{ borderRadius: '8px', marginRight: '12px' }} />
                    )}
                    <Box>
                      <Typography variant="body1" fontWeight="500">{c.title}</Typography>
                      <Typography variant="body2" color="textSecondary" sx={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {c.description}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip label={c.category} size="small" color="primary" variant="outlined" />
                </TableCell>
                <TableCell>
                  <Typography fontWeight="500">{c.label}</Typography>
                </TableCell>
                <TableCell>
                  <Typography fontWeight="500">{c.days}</Typography>
                </TableCell>
                <TableCell>
                  <IconButton color="primary" onClick={() => openEditDialog(c)} sx={{ mr: 1 }}>
                    <Edit />
                  </IconButton>
                  <IconButton color="error" onClick={() => onDelete(c._id)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: '12px' } }}>
        <DialogTitle sx={{ 
          backgroundColor: 'primary.main', 
          color: 'white', 
          fontWeight: '600',
          padding: '16px 24px'
        }}>
          {editing ? "Edit Course" : "Add New Course"}
        </DialogTitle>
        <DialogContent sx={{ padding: '24px' }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormSection>
                <Typography variant="h6" gutterBottom>
                  Course Information
                </Typography>
                <TextField
                  margin="dense"
                  label="Course Title"
                  fullWidth
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  sx={{ mb: 2 }}
                />
                <TextField
                  margin="dense"
                  label="Description"
                  fullWidth
                  multiline
                  rows={3}
                  required
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  sx={{ mb: 2 }}
                />
                <TextField
                  margin="dense"
                  label="Button Text"
                  fullWidth
                  value={form.buttonText}
                  onChange={(e) => setForm({ ...form, buttonText: e.target.value })}
                  sx={{ mb: 2 }}
                />
                <TextField
                  margin="dense"
                  label="Label (e.g., Course 1)"
                  fullWidth
                  required
                  value={form.label}
                  onChange={(e) => setForm({ ...form, label: e.target.value })}
                  sx={{ mb: 2 }}
                />
                <TextField
                  margin="dense"
                  label="Duration (e.g., 2 Days)"
                  fullWidth
                  required
                  value={form.days}
                  onChange={(e) => setForm({ ...form, days: e.target.value })}
                  sx={{ mb: 2 }}
                />
                
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel id="category-label">Category</InputLabel>
                  <Select
                    labelId="category-label"
                    value={form.category}
                    label="Category"
                    required
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                  >
                    {categories.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </FormSection>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormSection>
                <Typography variant="h6" gutterBottom>
                  Course Image
                </Typography>
                
                <TextField
                  margin="dense"
                  label="Or enter image URL"
                  fullWidth
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  sx={{ mt: 2 }}
                />
                
                {form.image && (
                  <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Image Preview
                    </Typography>
                    <CourseImage src={form.image} alt="Preview" />
                  </Box>
                )}
              </FormSection>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ padding: '16px 24px', borderTop: '1px solid #e0e0e0' }}>
          <Button onClick={() => setOpen(false)} sx={{ borderRadius: '8px' }}>
            Cancel
          </Button>
          <Button 
            onClick={onSave} 
            variant="contained" 
            disabled={uploading}
            sx={{ borderRadius: '8px' }}
          >
            {editing ? "Update Course" : "Add Course"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
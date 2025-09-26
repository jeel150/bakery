// // server/pagesApi.js
// import express from "express"
// import fs from "fs"
// import path from "path"

// const router = express.Router()
// const pagesDir = path.join(process.cwd(), "src/pages")

// // ✅ Delete a page file
// router.delete("/:filename", (req, res) => {
//   try {
//     const filePath = path.join(pagesDir, req.params.filename)

//     if (fs.existsSync(filePath)) {
//       fs.unlinkSync(filePath)
//       return res.json({ success: true, message: "Page deleted" })
//     } else {
//       return res.status(404).json({ success: false, message: "File not found" })
//     }
//   } catch (err) {
//     console.error("Error deleting file:", err)
//     res.status(500).json({ success: false, message: "Failed to delete file" })
//   }
// })

// export default router

// server/pagesApi.js
import express from "express"
import fs from "fs"
import path from "path"

const router = express.Router()
const pagesDir = path.join(process.cwd(), "src/pages")

// ✅ Ensure pages directory exists
const ensurePagesDir = () => {
  if (!fs.existsSync(pagesDir)) {
    fs.mkdirSync(pagesDir, { recursive: true });
  }
};

// ✅ Get all pages
router.get("/", (req, res) => {
  try {
    ensurePagesDir();
    const files = fs.readdirSync(pagesDir);
    const pages = files.filter(file => file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.ts') || file.endsWith('.tsx'));
    res.json({ success: true, pages });
  } catch (err) {
    console.error("Error reading pages directory:", err);
    res.status(500).json({ success: false, message: "Failed to read pages" });
  }
});

// ✅ Get a specific page
router.get("/:filename", (req, res) => {
  try {
    ensurePagesDir();
    const filename = req.params.filename;
    
    // Security: Prevent directory traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({ success: false, message: "Invalid filename" });
    }
    
    const filePath = path.join(pagesDir, filename);
    
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      res.json({ success: true, filename, content });
    } else {
      res.status(404).json({ success: false, message: "Page not found" });
    }
  } catch (err) {
    console.error("Error reading page:", err);
    res.status(500).json({ success: false, message: "Failed to read page" });
  }
});

// ✅ Create or update a page
router.post("/", (req, res) => {
  try {
    ensurePagesDir();
    const { filename, content } = req.body;
    
    if (!filename || !content) {
      return res.status(400).json({ success: false, message: "Filename and content are required" });
    }
    
    // Security: Prevent directory traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({ success: false, message: "Invalid filename" });
    }
    
    const filePath = path.join(pagesDir, filename);
    fs.writeFileSync(filePath, content, 'utf8');
    
    res.json({ success: true, message: "Page saved successfully" });
  } catch (err) {
    console.error("Error saving page:", err);
    res.status(500).json({ success: false, message: "Failed to save page" });
  }
});

// ✅ Delete a page file
router.delete("/:filename", (req, res) => {
  try {
    ensurePagesDir();
    const filename = req.params.filename;
    
    // Security: Prevent directory traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({ success: false, message: "Invalid filename" });
    }
    
    const filePath = path.join(pagesDir, filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return res.json({ success: true, message: "Page deleted successfully" });
    } else {
      return res.status(404).json({ success: false, message: "File not found" });
    }
  } catch (err) {
    console.error("Error deleting file:", err);
    res.status(500).json({ success: false, message: "Failed to delete file" });
  }
});

export default router
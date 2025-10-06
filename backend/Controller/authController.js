// authController.js
import User from "../Models/User.js";
import jwt from "jsonwebtoken";
import { sendWelcomeEmail } from "../utils/emailService.js"; // Import the email service

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// Register User
export const registerUser = async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;

    // Validate role
    const validRoles = ["user", "admin"];
    const userRole = validRoles.includes(role) ? role : "user";

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "User already exists" });

    const user = await User.create({ 
      name, 
      email, 
      phone, 
      password, 
      role: userRole  // Use validated role
    });

     // Send welcome email for registration (optional)
    sendWelcomeEmail(user.email, user.name, "registration").catch(error => {
      console.error('Failed to send welcome email:', error);
    });

    res.status(201).json({
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      },
      message:  `${user.role} registration successful!`
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login User (same for user/admin)
// export const loginUser = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     const user = await User.findOne({ email });
//     if (!user) return res.status(400).json({ message: "Invalid email or password" });

//     if (user.status === "blocked") {
//       return res.status(403).json({ message: "Your account has been blocked. Please contact support." });
//     }

//     const isMatch = await user.matchPassword(password);
//     if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

//       const hasAdminAccess = user.role === "admin" || user.isCoAdmin;

//          if (!hasAdminAccess) {
//       return res.status(403).json({ 
//         message: "You don't have admin access. Please contact administrator." 
//       });
//     }

//     res.json({
//       token: generateToken(user._id),
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         phone: user.phone,
//         role: user.role,
//          isCoAdmin: user.isCoAdmin 
//       },
//       message: "Login successful!"
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };
// authController.js - Updated loginUser function
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid email or password" });

    if (user.status === "blocked") {
      return res.status(403).json({ message: "Your account has been blocked. Please contact support." });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

    // Check if this is an admin login attempt
    const isAdminLoginEndpoint = req.originalUrl.includes('/admin/login');
    
    if (isAdminLoginEndpoint) {
      // For admin login, require admin role or co-admin access
      const hasAdminAccess = user.role === "admin" || user.isCoAdmin;
      if (!hasAdminAccess) {
        return res.status(403).json({ 
          message: "You don't have admin access. Please contact administrator." 
        });
      }
    } else {
      // For regular user login, allow any role but show appropriate message
      if (user.role === "admin" || user.isCoAdmin) {
        return res.status(403).json({ 
          message: "Admin users should login through admin portal." 
        });
      }
    }

    res.json({
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isCoAdmin: user.isCoAdmin 
      },
      message: "Login successful!"
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// authController.js - Add this function
export const verifyToken = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isCoAdmin: user.isCoAdmin,
        status: user.status
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};




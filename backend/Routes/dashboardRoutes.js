import express from "express";
import { getDashboardData, getReportData } from "../Controller/dashboardController.js";

const router = express.Router();

// Public routes for dashboard data
router.get('/dashboard', getDashboardData);
router.get('/reports', getReportData);

export default router;
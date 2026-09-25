import express from "express";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";
import authRoutes from "./routes/auth.routes.js";
import staffRoutes from "./routes/staff.routes.js";
import membersRoutes from "./routes/members.routes.js";
import beneficiariesRoutes from "./routes/beneficiaries.routes.js";
import assistanceRoutes from "./routes/assistance.routes.js";
import donationsRoutes from "./routes/donations.routes.js";
import resourcesRoutes from "./routes/resources.routes.js";
import distributionsRoutes from "./routes/distributions.routes.js";
import activitiesRoutes from "./routes/activities.routes.js";
import contentRoutes from "./routes/content.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import reportsRoutes from "./routes/reports.routes.js";
import contactRoutes from "./routes/contact.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import annualPlansRoutes from "./routes/annualPlans.routes.js";
import { notFound,errorHandler } from "./middleware/error.middleware.js";
const app=express();
const __dirname=path.dirname(fileURLToPath(import.meta.url));
const configuredOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((x) => x.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    const isLocalDev = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
    if (configuredOrigins.includes(origin) || (process.env.NODE_ENV !== "production" && isLocalDev)) {
      return callback(null, true);
    }
    return callback(new Error("Origin is not allowed by CORS"));
  },
  credentials: true,
}));
app.use(express.json({limit:"10mb"}));
app.use(express.urlencoded({extended:true,limit:"10mb"}));
app.use("/uploads/public", express.static(path.resolve(__dirname, "../uploads/public")));
app.get("/",(req,res)=>res.json({success:true,message:"Ishraq Charity API is running",data:{version:"1.0.0"}}));
app.get("/api/health",(req,res)=>res.json({success:true,message:"API healthy"}));
app.use("/api/auth",authRoutes);
app.use("/api/staff",staffRoutes);
app.use("/api/members",membersRoutes);
app.use("/api/beneficiaries",beneficiariesRoutes);
app.use("/api/assistance",assistanceRoutes);
app.use("/api/donations",donationsRoutes);
app.use("/api/resources",resourcesRoutes);
app.use("/api/distributions",distributionsRoutes);
app.use("/api/activities",activitiesRoutes);
app.use("/api/content",contentRoutes);
app.use("/api/dashboard",dashboardRoutes);
app.use("/api/reports",reportsRoutes);
app.use("/api/contact",contactRoutes);
app.use("/api/uploads",uploadRoutes);
app.use("/api/annual-plans",annualPlansRoutes);
app.use(notFound); app.use(errorHandler);
export default app;

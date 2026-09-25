import { Router } from "express";
import { login, me, logout, updateProfile, changePassword } from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const r = Router();
r.post("/login", login);
r.get("/me", authenticate, me);
r.put("/profile", authenticate, updateProfile);
r.put("/password", authenticate, changePassword);
r.post("/logout", authenticate, logout);
export default r;

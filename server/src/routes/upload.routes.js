import { Router } from "express";
import { uploadBase64, uploadDonationProof, downloadPrivate } from "../controllers/upload.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const r = Router();

r.post("/donation-proof", uploadDonationProof);

r.post("/", authenticate, uploadBase64);
r.get("/private/:filename", authenticate, downloadPrivate);

export default r;

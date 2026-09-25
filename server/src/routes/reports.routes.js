import { Router } from "express";
import * as reportsController from "../controllers/reports.controller.js";
import {
  authenticate,
  authorize,
} from "../middleware/auth.middleware.js";

const router = Router();

router.use(
  authenticate,
  authorize("Admin")
);

router.get(
  "/summary",
  reportsController.summary
);

router.get(
  "/beneficiaries",
  reportsController.beneficiaryReport
);

router.get(
  "/donations",
  reportsController.donationReport
);

router.get(
  "/distributions",
  reportsController.distributionReport
);

export default router;


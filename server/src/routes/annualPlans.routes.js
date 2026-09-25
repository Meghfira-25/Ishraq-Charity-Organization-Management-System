import { Router } from "express";
import * as annualPlansController from "../controllers/annualPlans.controller.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/public", annualPlansController.publicPlans);
router.get("/public/:id", annualPlansController.publicPlanById);

router.get(
  "/",
  authenticate,
  authorize("Admin"),
  annualPlansController.listPlans
);

router.get(
  "/:id",
  authenticate,
  authorize("Admin"),
  annualPlansController.getPlan
);

router.post(
  "/",
  authenticate,
  authorize("Admin"),
  annualPlansController.createPlan
);

router.put(
  "/:id",
  authenticate,
  authorize("Admin"),
  annualPlansController.updatePlan
);

router.delete(
  "/:id",
  authenticate,
  authorize("Admin"),
  annualPlansController.deletePlan
);

router.post(
  "/:id/images",
  authenticate,
  authorize("Admin"),
  annualPlansController.addPlanImage
);

router.delete(
  "/images/:imageId",
  authenticate,
  authorize("Admin"),
  annualPlansController.deletePlanImage
);

export default router;

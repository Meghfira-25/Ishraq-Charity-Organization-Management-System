import { Router } from "express";
import * as staffController from "../controllers/staff.controller.js";
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
  "/",
  staffController.listStaff
);

router.post(
  "/",
  staffController.createStaff
);

router.get(
  "/:id",
  staffController.getStaff
);

router.put(
  "/:id",
  staffController.updateStaff
);

router.patch(
  "/:id/password",
  staffController.resetStaffPassword
);

export default router;


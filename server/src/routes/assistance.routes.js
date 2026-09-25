import { Router } from "express";
import * as assistanceController from "../controllers/assistance.controller.js";

import {
  authenticate,
  authorize,
} from "../middleware/auth.middleware.js";

const router = Router();

router.use(authenticate);

router.get(
  "/",
  authorize(
    "Admin",
    "Registration-Officer",
    "Distribution-Officer"
  ),
  assistanceController.listAssistance
);

router.get(
  "/:id",
  authorize(
    "Admin",
    "Registration-Officer",
    "Distribution-Officer"
  ),
  assistanceController.getAssistance
);

router.post(
  "/",
  authorize(
    "Admin",
    "Registration-Officer"
  ),
  assistanceController.createAssistance
);

router.put(
  "/:id",
  authorize(
    "Admin",
    "Registration-Officer"
  ),
  assistanceController.updateAssistance
);

router.patch(
  "/:id/review",
  authorize("Admin"),
  assistanceController.reviewAssistance
);

export default router;


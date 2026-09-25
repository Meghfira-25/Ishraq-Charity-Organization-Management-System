import { Router } from "express";
import * as distributionsController from "../controllers/distributions.controller.js";

import {
  authenticate,
  authorize,
} from "../middleware/auth.middleware.js";

const router = Router();

router.use(
  authenticate,
  authorize(
    "Admin",
    "Distribution-Officer"
  )
);

router.get(
  "/",
  distributionsController.listDistributions
);

router.get(
  "/:id",
  distributionsController.getDistribution
);

router.post(
  "/",
  distributionsController.createDistribution
);

export default router;


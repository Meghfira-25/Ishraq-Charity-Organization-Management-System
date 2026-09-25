import { Router } from "express";
import * as activitiesController from "../controllers/activities.controller.js";

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
  activitiesController.listActivities
);

router.get(
  "/:id",
  activitiesController.getActivity
);

router.post(
  "/",
  activitiesController.createActivity
);

router.put(
  "/:id",
  activitiesController.updateActivity
);

router.delete(
  "/:id",
  authorize("Admin"),
  activitiesController.deleteActivity
);

export default router;


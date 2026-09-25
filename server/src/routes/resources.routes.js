import { Router } from "express";
import * as resourcesController from "../controllers/resources.controller.js";

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
  resourcesController.listResources
);

router.get(
  "/:id",
  resourcesController.getResource
);

router.post(
  "/",
  resourcesController.createResource
);

router.put(
  "/:id",
  resourcesController.updateResource
);

export default router;


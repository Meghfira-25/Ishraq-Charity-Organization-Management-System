import { Router } from "express";
import * as contentController from "../controllers/content.controller.js";

import {
  authenticate,
  authorize,
} from "../middleware/auth.middleware.js";

const router = Router();

router.get(
  "/public",
  contentController.publicContent
);

router.get(
  "/public/:id",
  contentController.publicContentById
);

router.get(
  "/",
  authenticate,
  authorize("Admin"),
  contentController.listContent
);

router.post(
  "/",
  authenticate,
  authorize("Admin"),
  contentController.createContent
);

router.put(
  "/:id",
  authenticate,
  authorize("Admin"),
  contentController.updateContent
);

router.delete(
  "/:id",
  authenticate,
  authorize("Admin"),
  contentController.deleteContent
);

export default router;


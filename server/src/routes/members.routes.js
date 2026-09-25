import { Router } from "express";
import * as membersController from "../controllers/members.controller.js";

import {
  authenticate,
  authorize,
} from "../middleware/auth.middleware.js";

const router = Router();

router.post(
  "/apply",
  membersController.applyMember
);

router.get(
  "/",
  authenticate,
  authorize("Admin"),
  membersController.listMembers
);

router.get(
  "/:id",
  authenticate,
  authorize("Admin"),
  membersController.getMember
);

router.put(
  "/:id",
  authenticate,
  authorize("Admin"),
  membersController.updateMemberApplication
);

router.patch(
  "/:id/review",
  authenticate,
  authorize("Admin"),
  membersController.reviewMember
);

export default router;


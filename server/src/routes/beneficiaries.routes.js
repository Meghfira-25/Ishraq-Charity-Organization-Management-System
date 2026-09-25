import { Router } from "express";
import * as beneficiariesController from "../controllers/beneficiaries.controller.js";

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
  beneficiariesController.listBeneficiaries
);

router.get(
  "/:id",
  authorize(
    "Admin",
    "Registration-Officer",
    "Distribution-Officer"
  ),
  beneficiariesController.getBeneficiary
);

router.post(
  "/",
  authorize(
    "Admin",
    "Registration-Officer"
  ),
  beneficiariesController.createBeneficiary
);

router.put(
  "/:id",
  authorize(
    "Admin",
    "Registration-Officer"
  ),
  beneficiariesController.updateBeneficiary
);

router.patch(
  "/:id/review",
  authorize("Admin"),
  beneficiariesController.reviewBeneficiary
);

router.post(
  "/:id/children",
  authorize(
    "Admin",
    "Registration-Officer"
  ),
  beneficiariesController.addChild
);

router.put(
  "/:id/children/:childId",
  authorize(
    "Admin",
    "Registration-Officer"
  ),
  beneficiariesController.updateChild
);

router.delete(
  "/:id/children/:childId",
  authorize(
    "Admin",
    "Registration-Officer"
  ),
  beneficiariesController.deleteChild
);

export default router;


import { Router } from "express";
import * as donationsController from "../controllers/donations.controller.js";
import {
  authenticate,
  authorize,
} from "../middleware/auth.middleware.js";

const router = Router();

router.post(
  "/submit",
  donationsController.createDonation
);

router.get(
  "/",
  authenticate,
  authorize(
    "Admin",
    "Distribution-Officer"
  ),
  donationsController.listDonations
);

router.get(
  "/:id",
  authenticate,
  authorize(
    "Admin",
    "Distribution-Officer"
  ),
  donationsController.getDonation
);

router.patch(
  "/:id/review",
  authenticate,
  authorize("Admin"),
  donationsController.reviewDonation
);

router.post(
  "/:id/create-resource",
  authenticate,
  authorize(
    "Admin",
    "Distribution-Officer"
  ),
  donationsController.convertDonationToResource
);

export default router;


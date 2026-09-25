import { Router } from "express";
import * as c from "../controllers/contact.controller.js";
import { authenticate,authorize } from "../middleware/auth.middleware.js";

const r=Router();
r.post("/",c.submitContact);
r.get("/",authenticate,authorize("Admin"),c.listContacts);
r.patch("/:id",authenticate,authorize("Admin"),c.updateContact);
r.delete("/:id",authenticate,authorize("Admin"),c.deleteContact);
export default r;

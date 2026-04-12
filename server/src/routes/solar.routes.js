import { Router } from "express";
import { getSolar } from "../controllers/solar.controller.js";

const router = Router();

router.get("/", getSolar);

export default router;

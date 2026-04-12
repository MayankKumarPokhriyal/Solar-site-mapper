import { Router } from "express";
import { getPvwatts } from "../controllers/pvwatts.controller.js";

const router = Router();

router.get("/", getPvwatts);

export default router;

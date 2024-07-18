import express from "express";
import * as propensityController from "../controllers/propensity-controller.js";
import { checkLoggedIn } from "../middleware/auth-middleware.js";

const router = express.Router();

router.get("/propensity/getPropensity", checkLoggedIn, propensityController.getPropensity); // 투자성향 가져오기
router.put("/propensity/updatePropensity", checkLoggedIn, propensityController.updatePropensity); // 투자성향 업데이트

export default router;

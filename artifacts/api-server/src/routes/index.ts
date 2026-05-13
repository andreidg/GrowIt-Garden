import { Router, type IRouter } from "express";
import healthRouter from "./health";
import weatherRiskRouter from "./weather-risk";
import aiPlanRouter from "./ai-plan";

const router: IRouter = Router();

router.use(healthRouter);
router.use(weatherRiskRouter);
router.use(aiPlanRouter);

export default router;

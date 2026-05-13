import { Router, type IRouter } from "express";
import healthRouter from "./health";
import weatherRiskRouter from "./weather-risk";
import aiPlanRouter from "./ai-plan";
import analyzePhotoRouter from "./analyze-photo";

const router: IRouter = Router();

router.use(healthRouter);
router.use(weatherRiskRouter);
router.use(aiPlanRouter);
router.use(analyzePhotoRouter);

export default router;

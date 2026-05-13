import { Router, type IRouter } from "express";
import healthRouter from "./health";
import weatherRiskRouter from "./weather-risk";
import forecastRouter from "./forecast";
import aiPlanRouter from "./ai-plan";
import analyzePhotoRouter from "./analyze-photo";
import authRouter from "./auth";

const router: IRouter = Router();

router.use(healthRouter);
router.use(weatherRiskRouter);
router.use(forecastRouter);
router.use(aiPlanRouter);
router.use(analyzePhotoRouter);
router.use(authRouter);

export default router;

import { Router, type IRouter } from "express";
import healthRouter from "./health";
import weatherRiskRouter from "./weather-risk";

const router: IRouter = Router();

router.use(healthRouter);
router.use(weatherRiskRouter);

export default router;

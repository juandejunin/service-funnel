import { Router } from "express";
import { ArticleController } from "../controllers/article.controller";
import { ArticleService } from "../services/article/article.service";

const router = Router();
const articleService = new ArticleService();
const articleController = new ArticleController(articleService);

router.post("/", (req, res) => articleController.create(req, res));
router.get("/", (req, res) => articleController.getAll(req, res));

export default router;

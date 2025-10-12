// src/controllers/article.controller.ts
import { Request, Response } from "express";
import { ArticleService } from "../services/article/article.service";

export class ArticleController {
  private articleService: ArticleService;

  constructor(articleService: ArticleService) {
    this.articleService = articleService;
  }

  async create(req: Request, res: Response) {
    try {
      const { titulo, contenido, autor } = req.body;
      const nuevoArticulo = await this.articleService.createArticle({
        titulo,
        contenido,
        autor,
      });

      res.status(201).json({
        success: true,
        message: "Artículo creado correctamente",
        articulo: nuevoArticulo,
      });
    } catch (error) {
      console.error("Error al crear artículo:", error);
      res.status(500).json({
        success: false,
        error: "Error interno al crear el artículo",
      });
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const articulos = await this.articleService.getAllArticles();
      res.status(200).json({ success: true, articulos });
    } catch (error) {
      console.error("Error al obtener artículos:", error);
      res.status(500).json({
        success: false,
        error: "Error interno al obtener los artículos",
      });
    }
  }
}

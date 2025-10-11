// src/services/article.service.ts
import { ArticleModel } from "../../models/article.model";

export interface ArticleData {
  titulo: string;
  contenido: string;
  autor?: string;
}

export class ArticleService {
  async createArticle(data: ArticleData) {
    const nuevoArticulo = new ArticleModel({
      titulo: data.titulo,
      contenido: data.contenido,
      autor: data.autor || "Anónimo",
    });

    return await nuevoArticulo.save();
  }

  async getAllArticles() {
    return await ArticleModel.find().sort({ fecha: -1 });
  }
}

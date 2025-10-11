// src/models/article.model.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IArticle extends Document {
  titulo: string;
  contenido: string;
  autor: string;
  fecha: Date;
}

const ArticleSchema = new Schema<IArticle>({
  titulo: { type: String, required: true },
  contenido: { type: String, required: true },
  autor: { type: String, default: "Anónimo" },
  fecha: { type: Date, default: Date.now },
});

export const ArticleModel = mongoose.model<IArticle>("Article", ArticleSchema);

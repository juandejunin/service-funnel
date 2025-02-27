import mongoose, { Schema, Document } from "mongoose";

export interface IVisit extends Document {
  _id: string; // Especificamos que _id es una cadena
  totalVisits: number;
  lastUpdated: Date;
}

const VisitSchema: Schema = new Schema({
  _id: { type: String, required: true }, // Definimos _id como String
  totalVisits: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now },
});

export const VisitModel = mongoose.model<IVisit>("Visit", VisitSchema);

// ID fijo para el documento del contador
export const VISIT_COUNTER_ID = "visit_counter_singleton"; // Usamos un valor consistente
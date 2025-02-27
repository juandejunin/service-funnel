import { VisitModel, IVisit, VISIT_COUNTER_ID } from "../../models/visit.model";

class DatabaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DatabaseError";
  }
}

export class VisitService {
  // Incrementar el contador de visitas
  async incrementVisit(): Promise<IVisit> {
    try {
      const updatedVisit = await VisitModel.findOneAndUpdate(
        { _id: VISIT_COUNTER_ID },
        { 
          $inc: { totalVisits: 1 }, // Incrementa el contador
          $set: { lastUpdated: new Date() } // Actualiza la fecha
        },
        { 
          upsert: true, // Crea el documento si no existe
          new: true // Devuelve el documento actualizado
        }
      );
      return updatedVisit;
    } catch (error) {
      throw new DatabaseError(`Error al incrementar las visitas: ${(error as Error).message}`);
    }
  }

  // Consultar el número total de visitas
  async getVisitCount(): Promise<number> {
    try {
      const visitDoc = await VisitModel.findOne({ _id: VISIT_COUNTER_ID });
      return visitDoc ? visitDoc.totalVisits : 0;
    } catch (error) {
      throw new DatabaseError(`Error al consultar las visitas: ${(error as Error).message}`);
    }
  }
}

export const visitService = new VisitService();
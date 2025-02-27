import { Request, Response } from "express";
import { VisitService } from "../services/visit/visit.service";

export class VisitController {
  private visitService: VisitService;

  constructor() {
    this.visitService = new VisitService();
  }

  // Registrar una visita
  async trackVisit(req: Request, res: Response): Promise<void> {
    try {
      const updatedVisit = await this.visitService.incrementVisit();
      res.status(200).json({
        success: true,
        visits: updatedVisit.totalVisits,
      });
    } catch (error) {
      console.error("Error tracking visit:", error);
      res.status(500).json({
        success: false,
        error: "Error al registrar la visita",
      });
    }
  }

  // Consultar el total de visitas
  async getVisits(req: Request, res: Response): Promise<void> {
    try {
      const totalVisits = await this.visitService.getVisitCount();
      res.status(200).json({
        success: true,
        visits: totalVisits,
      });
    } catch (error) {
      console.error("Error fetching visits:", error);
      res.status(500).json({
        success: false,
        error: "Error al consultar las visitas",
      });
    }
  }
}
import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { PurchaseTicketsUseCase } from "./PurchaseTicketsUseCase";

export class RaffleController {
  constructor(private purchaseUseCase: PurchaseTicketsUseCase) {}

  async purchase(request: FastifyRequest, reply: FastifyReply) {
    const purchaseSchema = z.object({
      raffleId: z.string().uuid(),
      selectedNumbers: z.array(z.string()).min(1)
    });

    try {
      const { raffleId, selectedNumbers } = purchaseSchema.parse(request.body);
      const buyerId = (request as any).user?.sub; 
      
      if (!buyerId) throw new Error("Usuário não autenticado");

      const result = await this.purchaseUseCase.execute({ raffleId, buyerId, selectedNumbers });
      return reply.status(201).send({ success: true, data: result });
    } catch (err: any) {
      return reply.status(400).send({ success: false, error: err.message });
    }
  }
}
import { RaffleRepository } from "../../domain/repositories/RaffleRepository";
import { PurchaseRepository } from "../../domain/repositories/PurchaseRepository";

interface PurchaseRequest {
  raffleId: string;
  buyerId: string;
  selectedNumbers: string[];
}

export class PurchaseTicketsUseCase {
  constructor(
    private raffleRepository: RaffleRepository,
    private purchaseRepository: PurchaseRepository
  ) {}

  async execute({ raffleId, buyerId, selectedNumbers }: PurchaseRequest) {
    const raffle = await this.raffleRepository.findById(raffleId);
    
    if (!raffle) throw new Error("Rifa não encontrada");

    // Regra de Negócio: Valida se números estão livres
    raffle.reserveTickets(selectedNumbers);

    // Persistência Atômica (Transação)
    const purchase = await this.purchaseRepository.create({
      raffleId,
      buyerId,
      numbers: selectedNumbers,
      status: 'PENDING'
    });

    return purchase;
  }
}
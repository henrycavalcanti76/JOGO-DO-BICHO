import { RaffleRepository } from "../../domain/repositories/RaffleRepository";
import { PurchaseRepository } from "../../domain/repositories/PurchaseRepository";
import { Raffle } from "../../domain/entities/Raffle";

interface PurchaseRequest {
  raffleId: string;
  buyerId: string;
  selectedNumbers: string[];
}

export class PurchaseTicketsUseCase {
  constructor(
    private raffleRepository: RaffleRepository,
    private purchaseRepository: PurchaseRepository,
    private database: any,
    private paymentProvider: any
  ) {}

  async execute({ raffleId, buyerId, selectedNumbers }: PurchaseRequest) {
    // Início da Transação para evitar Race Conditions
    return await this.database.transaction(async (tx) => {
      const raffle = await this.raffleRepository.findById(raffleId, tx);
      if (!raffle) throw new Error("Rifa não encontrada");

      // Garante que a lógica de domínio seja executada e valide os números
      raffle.reserveTickets(selectedNumbers);

      const isAvailable = await this.raffleRepository.checkAvailability(raffleId, selectedNumbers, tx);
      if (!isAvailable) throw new Error("Um ou mais números acabaram de ser reservados por outro usuário.");

      const payment = await this.paymentProvider.generatePix({
        amount: raffle.props.pricePerTicket * selectedNumbers.length,
        description: `Rifa: ${raffle.props.title}`,
        buyerId: buyerId
      });

      // Criação do Pedido e reserva dos números
      const purchase = await this.purchaseRepository.create({
        raffleId,
        buyerId,
        numbers: selectedNumbers,
        status: 'PENDING',
        paymentId: payment.id,
        pixCopyPaste: payment.copyPaste,
        expiresAt: new Date(Date.now() + 15 * 60000) // 15 min
      }, tx);

      return purchase;
    });
  }
}
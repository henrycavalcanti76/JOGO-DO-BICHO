export interface RaffleProps {
  title: string;
  pricePerTicket: number;
  totalTickets: number;
  soldTickets: string[]; // Números já reservados/vendidos
  status: 'ACTIVE' | 'FINISHED' | 'DRAWN';
  createdAt: Date;
}

export class Raffle {
  constructor(public readonly props: RaffleProps, public readonly id?: string) {
    if (props.totalTickets <= 0) throw new Error("Total de tickets deve ser maior que zero");
    if (props.pricePerTicket < 0) throw new Error("Preço não pode ser negativo");
  }

  public isTicketAvailable(numbers: string[]): boolean {
    return !numbers.some(num => this.props.soldTickets.includes(num));
  }

  public reserveTickets(numbers: string[]) {
    if (!this.isTicketAvailable(numbers)) {
      throw new Error("Um ou mais números já estão ocupados.");
    }
    this.props.soldTickets.push(...numbers);
  }
}
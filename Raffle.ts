export interface RaffleProps {
  title: string;
  pricePerTicket: number;
  totalTickets: number;
  soldTickets: string[]; // Números já reservados/vendidos
  status: 'ACTIVE' | 'FINISHED' | 'DRAWN';
  createdAt: Date;
}

export class Raffle {
  constructor(public readonly props: RaffleProps, public readonly id?: string) {}

  public isTicketAvailable(numbers: string[]): boolean {
    return !numbers.some(num => this.props.soldTickets.includes(num));
  }

  public reserveTickets(numbers: string[]) {
    if (!this.isTicketAvailable(numbers)) {
      throw new Error("Um ou mais números já foram reservados.");
    }
    this.props.soldTickets.push(...numbers);
  }
}
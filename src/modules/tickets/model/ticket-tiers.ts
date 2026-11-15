export type TicketTier = {
  id: string;
  name: string;
  priceKzt: number;
  perks: string[];
  isFeatured?: boolean;
};

export const TICKET_TIERS: TicketTier[] = [
  {
    id: 'guest',
    name: 'Гость церемонии',
    priceKzt: 1000,
    perks: ['Вход на церемонию', 'Вручение всех наград вживую', 'Вся компания в одном месте'],
  },
];

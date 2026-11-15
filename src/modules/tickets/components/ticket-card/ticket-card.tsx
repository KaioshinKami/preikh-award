import type { TicketTier } from '../../model/ticket-tiers';
import styles from './ticket-card.module.scss';

const priceFormat = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'KZT',
  currencyDisplay: 'narrowSymbol',
  maximumFractionDigits: 0,
});

type TicketCardProps = {
  tier: TicketTier;
};

export function TicketCard({ tier }: TicketCardProps) {
  return (
    <article className={styles.card} data-featured={Boolean(tier.isFeatured)}>
      {tier.isFeatured && <span className={styles.badge}>Выбор зрителей</span>}
      <h3 className={styles.name}>{tier.name}</h3>
      <p className={styles.price}>{priceFormat.format(tier.priceKzt)}</p>
      <ul className={styles.perks}>
        {tier.perks.map((perk) => (
          <li key={perk} className={styles.perk}>
            <svg className={styles.check} viewBox='0 0 16 16' aria-hidden='true'>
              <path d='M3 8.5 6.5 12 13 4.5' fill='none' stroke='currentColor' strokeWidth='2' />
            </svg>
            {perk}
          </li>
        ))}
      </ul>
    </article>
  );
}

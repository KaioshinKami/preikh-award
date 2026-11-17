import { LOCALE_TAGS, useLocale } from '@/shared/i18n';
import type { TicketTier } from '../../model/ticket-tiers';
import styles from './ticket-card.module.scss';

type TicketCardProps = {
  tier: TicketTier;
  featuredBadge: string;
};

function formatPrice(priceKzt: number, localeTag: string): string {
  return new Intl.NumberFormat(localeTag, {
    style: 'currency',
    currency: 'KZT',
    currencyDisplay: 'narrowSymbol',
    maximumFractionDigits: 0,
  }).format(priceKzt);
}

export function TicketCard({ tier, featuredBadge }: TicketCardProps) {
  const locale = useLocale();

  return (
    <article className={styles.card} data-featured={Boolean(tier.isFeatured)}>
      {tier.isFeatured && <span className={styles.badge}>{featuredBadge}</span>}
      <h3 className={styles.name}>{tier.name}</h3>
      <p className={styles.price}>{formatPrice(tier.priceKzt, LOCALE_TAGS[locale])}</p>
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

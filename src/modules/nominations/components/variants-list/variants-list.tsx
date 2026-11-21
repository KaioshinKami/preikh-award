import { useAuth } from '@/modules/auth';
import { Button } from '@/shared/components';
import { useLocale, useMessages } from '@/shared/i18n';
import { formatVotes } from '../../lib/format-votes';
import { NOMINATIONS_MESSAGES } from '../../model/nominations-messages';
import type { Variant } from '../../model/types';
import styles from './variants-list.module.scss';

type VariantsListProps = {
  variants: Variant[];
  pendingId: number | null;
  onToggleSupport: (variant: Variant) => void;
};

// Everyone sees the picks; supporting one needs an account, so a guest is asked to sign in.
export function VariantsList({ variants, pendingId, onToggleSupport }: VariantsListProps) {
  const t = useMessages(NOMINATIONS_MESSAGES).ownVariant;
  const locale = useLocale();
  const { user, openAuthDialog } = useAuth();

  return (
    <div className={styles.variants}>
      <h3 className={styles.title}>{t.listTitle}</h3>

      {variants.length === 0 ? (
        <p className={styles.empty}>{t.empty}</p>
      ) : (
        <ul className={styles.list}>
          {variants.map((variant) => (
            <li key={variant.id} className={styles.item} data-supported={variant.isSupported}>
              <span className={styles.name}>{variant.name}</span>
              <span className={styles.count}>{formatVotes(variant.supports, locale)}</span>
              {variant.isMine ? (
                <span className={styles.mine}>{t.mine}</span>
              ) : (
                <Button
                  size='small'
                  variant={variant.isSupported ? 'primary' : 'ghost'}
                  className={styles.button}
                  disabled={pendingId === variant.id}
                  aria-pressed={variant.isSupported}
                  title={variant.isSupported ? t.unsupportHint : undefined}
                  onClick={() => (user ? onToggleSupport(variant) : openAuthDialog('login'))}
                >
                  {variant.isSupported ? `✓ ${t.supported}` : t.support}
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

import { SnowflakeIcon } from '@/shared/components';
import styles from './nomination-emblem.module.scss';

type NominationEmblemProps = {
  imageUrl: string | null;
  className?: string;
};

// The nomination's logo on an ice glow, or an ice crystal with a snowflake until one is uploaded.
// Decorative: the nomination title is always printed next to it.
export function NominationEmblem({ imageUrl, className }: NominationEmblemProps) {
  const classNames = [styles.emblem, className].filter(Boolean).join(' ');

  return (
    <div className={classNames} aria-hidden='true'>
      {imageUrl ? (
        <img className={styles.image} src={imageUrl} alt='' loading='lazy' decoding='async' />
      ) : (
        <span className={styles.crystal}>
          <SnowflakeIcon className={styles.flake} strokeWidth={1.1} />
        </span>
      )}
    </div>
  );
}

import { useState } from 'react';
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
        <FadeInImage key={imageUrl} src={imageUrl} />
      ) : (
        <span className={styles.crystal}>
          <SnowflakeIcon className={styles.flake} strokeWidth={1.1} />
        </span>
      )}
    </div>
  );
}

// The ice glow behind is visible at once; the logo fades in over it when it has loaded.
function FadeInImage({ src }: { src: string }) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <img
      className={styles.image}
      data-loaded={isLoaded}
      src={src}
      alt=''
      loading='lazy'
      decoding='async'
      onLoad={() => setIsLoaded(true)}
    />
  );
}

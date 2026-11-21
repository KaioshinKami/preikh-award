import { useState } from 'react';
import { IceLoader, SnowflakeIcon } from '@/shared/components';
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
        <LoadingImage key={imageUrl} src={imageUrl} />
      ) : (
        <span className={styles.crystal}>
          <SnowflakeIcon className={styles.flake} strokeWidth={1.1} />
        </span>
      )}
    </div>
  );
}

// The ice loader turns until the logo has loaded; then the logo fades in and the loader stops.
function LoadingImage({ src }: { src: string }) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <>
      <IceLoader className={styles.loader} />
      <img
        className={styles.image}
        data-loaded={isLoaded}
        src={src}
        alt=''
        loading='lazy'
        decoding='async'
        onLoad={() => setIsLoaded(true)}
      />
    </>
  );
}

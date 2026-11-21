import { useState } from 'react';
import { IceLoader } from '@/shared/components';
import { getAvatarGradient, getInitials } from '../../lib/nominee-avatar-style';
import styles from './nominee-photo.module.scss';

type NomineePhotoProps = {
  name: string;
  // Keeps the placeholder colour the same in every language; defaults to the name.
  colorSeed?: string;
  avatarUrl: string | null;
  className?: string;
};

// With a photo: the ice loader turns on a dark card until the photo has loaded, then the photo
// fades in over it. Without one: the nominee's coloured initials.
// The name is printed under the photo, so the image itself is decorative.
export function NomineePhoto({ name, colorSeed = name, avatarUrl, className }: NomineePhotoProps) {
  const classNames = [styles.photo, className].filter(Boolean).join(' ');
  const [loadedUrl, setLoadedUrl] = useState<string | null>(null);

  if (!avatarUrl) {
    return (
      <span
        className={classNames}
        style={{ background: getAvatarGradient(colorSeed) }}
        aria-hidden='true'
      >
        <span className={styles.initials}>{getInitials(name)}</span>
      </span>
    );
  }

  const isLoaded = loadedUrl === avatarUrl;
  return (
    <span className={classNames} data-loaded={isLoaded} aria-hidden='true'>
      <IceLoader className={styles.loader} />
      <img
        key={avatarUrl}
        className={styles.image}
        src={avatarUrl}
        alt=''
        loading='lazy'
        decoding='async'
        onLoad={() => setLoadedUrl(avatarUrl)}
      />
    </span>
  );
}

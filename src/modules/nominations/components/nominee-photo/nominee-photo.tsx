import { useState } from 'react';
import { getAvatarGradient, getInitials } from '../../lib/nominee-avatar-style';
import styles from './nominee-photo.module.scss';

type NomineePhotoProps = {
  name: string;
  // Keeps the placeholder colour the same in every language; defaults to the name.
  colorSeed?: string;
  avatarUrl: string | null;
  className?: string;
};

// The coloured initials are always drawn; a photo fades in over them once it has loaded, so a
// card is never an empty box while the picture is on its way.
// The name is printed under the photo, so the image itself is decorative.
export function NomineePhoto({ name, colorSeed = name, avatarUrl, className }: NomineePhotoProps) {
  const classNames = [styles.photo, className].filter(Boolean).join(' ');

  return (
    <span
      className={classNames}
      style={{ background: getAvatarGradient(colorSeed) }}
      aria-hidden='true'
    >
      <span className={styles.initials}>{getInitials(name)}</span>
      {avatarUrl && <FadeInImage key={avatarUrl} src={avatarUrl} />}
    </span>
  );
}

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

import { getAvatarGradient, getInitials } from '../../lib/nominee-avatar-style';
import styles from './nominee-photo.module.scss';

type NomineePhotoProps = {
  name: string;
  // Keeps the placeholder colour the same in every language; defaults to the name.
  colorSeed?: string;
  avatarUrl: string | null;
  className?: string;
};

// The name is printed under the photo, so the image itself is decorative.
export function NomineePhoto({ name, colorSeed = name, avatarUrl, className }: NomineePhotoProps) {
  const classNames = [styles.photo, className].filter(Boolean).join(' ');

  if (avatarUrl) {
    return <img className={classNames} src={avatarUrl} alt='' loading='lazy' decoding='async' />;
  }

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

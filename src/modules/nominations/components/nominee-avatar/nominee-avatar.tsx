import { getAvatarGradient, getInitials } from '../../lib/nominee-avatar-style';
import styles from './nominee-avatar.module.scss';

type NomineeAvatarProps = {
  name: string;
  avatarUrl: string | null;
};

// The name is printed next to the avatar, so the image itself is decorative.
export function NomineeAvatar({ name, avatarUrl }: NomineeAvatarProps) {
  if (avatarUrl) {
    return (
      <img className={styles.avatar} src={avatarUrl} alt='' width={56} height={56} loading='lazy' />
    );
  }

  return (
    <span
      className={styles.avatar}
      style={{ background: getAvatarGradient(name) }}
      aria-hidden='true'
    >
      {getInitials(name)}
    </span>
  );
}

import { SnowflakeIcon } from '../snowflake-icon/snowflake-icon';
import styles from './logo.module.scss';

export function Logo() {
  return (
    <span className={styles.logo}>
      <SnowflakeIcon className={styles.icon} size={30} strokeWidth={1.6} />
      <span className={styles.wordmark}>
        <span className={styles.name}>PREIKH</span>
        <span className={styles.suffix}>AWARD</span>
      </span>
    </span>
  );
}

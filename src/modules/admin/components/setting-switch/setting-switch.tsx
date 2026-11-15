import styles from './setting-switch.module.scss';

type SettingSwitchProps = {
  title: string;
  description: string;
  isChecked: boolean;
  isDisabled: boolean;
  onToggle: () => void;
};

export function SettingSwitch({
  title,
  description,
  isChecked,
  isDisabled,
  onToggle,
}: SettingSwitchProps) {
  return (
    <label className={styles.switchRow}>
      <input
        type='checkbox'
        role='switch'
        className={styles.switchInput}
        checked={isChecked}
        disabled={isDisabled}
        onChange={onToggle}
      />
      <span className={styles.switchTrack} aria-hidden='true' />
      <span className={styles.switchText}>
        <span className={styles.switchTitle}>{title}</span>
        <span className={styles.switchDescription}>{description}</span>
      </span>
    </label>
  );
}

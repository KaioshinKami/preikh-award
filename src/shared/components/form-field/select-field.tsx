import { useId, type SelectHTMLAttributes } from 'react';
import styles from './form-field.module.scss';

type SelectOption = {
  value: string;
  label: string;
};

type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  options: SelectOption[];
};

export function SelectField({ label, options, ...selectProps }: SelectFieldProps) {
  const controlId = useId();

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={controlId}>
        {label}
      </label>
      <select id={controlId} className={styles.control} {...selectProps}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

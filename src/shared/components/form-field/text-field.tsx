import { useId, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import styles from './form-field.module.scss';

type FieldProps = {
  label: string;
  error?: string;
  hint?: string;
};

type TextFieldProps = FieldProps &
  (
    | ({ isMultiline?: false } & InputHTMLAttributes<HTMLInputElement>)
    | ({ isMultiline: true } & TextareaHTMLAttributes<HTMLTextAreaElement>)
  );

export function TextField({ label, error, hint, isMultiline, ...controlProps }: TextFieldProps) {
  const controlId = useId();
  const messageId = `${controlId}-message`;
  const message = error ?? hint;
  const describedBy = message ? messageId : undefined;

  return (
    <div className={styles.field} data-invalid={Boolean(error)}>
      <label className={styles.label} htmlFor={controlId}>
        {label}
      </label>
      {isMultiline ? (
        <textarea
          id={controlId}
          className={styles.control}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          {...(controlProps as TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : (
        <input
          id={controlId}
          className={styles.control}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          {...(controlProps as InputHTMLAttributes<HTMLInputElement>)}
        />
      )}
      {message && (
        <p id={messageId} className={styles.message}>
          {message}
        </p>
      )}
    </div>
  );
}

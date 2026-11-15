import type { FormEvent } from 'react';
import { Button, TextField } from '@/shared/components';
import type { NomineeInput } from '../../model/types';
import styles from './nominee-form.module.scss';

type NomineeFormProps = {
  initialValues?: NomineeInput;
  submitLabel: string;
  isSubmitting: boolean;
  onSubmit: (values: NomineeInput) => Promise<boolean>;
  onCancel?: () => void;
};

export function NomineeForm({
  initialValues,
  submitLabel,
  isSubmitting,
  onSubmit,
  onCancel,
}: NomineeFormProps) {
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const avatarUrl = String(formData.get('avatarUrl') ?? '').trim();
    const isSaved = await onSubmit({
      name: String(formData.get('name') ?? '').trim(),
      tagline: String(formData.get('tagline') ?? '').trim(),
      avatarUrl: avatarUrl || null,
    });
    if (isSaved && !initialValues) form.reset();
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <TextField
        label='Имя'
        name='name'
        required
        maxLength={80}
        defaultValue={initialValues?.name}
      />
      <TextField
        label='Подпись'
        name='tagline'
        maxLength={120}
        defaultValue={initialValues?.tagline}
      />
      <TextField
        label='Фото (https-ссылка)'
        name='avatarUrl'
        type='url'
        pattern='https://.*'
        maxLength={500}
        defaultValue={initialValues?.avatarUrl ?? ''}
      />
      <div className={styles.actions}>
        <Button type='submit' size='small' disabled={isSubmitting}>
          {submitLabel}
        </Button>
        {onCancel && (
          <Button variant='ghost' size='small' onClick={onCancel}>
            Отмена
          </Button>
        )}
      </div>
    </form>
  );
}

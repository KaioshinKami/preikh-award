import type { FormEvent } from 'react';
import { Button, TextField } from '@/shared/components';
import type { NominationInput } from '../../model/types';
import styles from './nomination-form.module.scss';

type NominationFormProps = {
  initialValues?: NominationInput;
  submitLabel: string;
  isSubmitting: boolean;
  onSubmit: (values: NominationInput) => Promise<boolean>;
  onCancel?: () => void;
};

export function NominationForm({
  initialValues,
  submitLabel,
  isSubmitting,
  onSubmit,
  onCancel,
}: NominationFormProps) {
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const isSaved = await onSubmit({
      title: String(formData.get('title') ?? '').trim(),
      category: String(formData.get('category') ?? '').trim(),
      description: String(formData.get('description') ?? '').trim(),
    });
    if (isSaved && !initialValues) form.reset();
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.row}>
        <TextField
          label='Название'
          name='title'
          required
          maxLength={80}
          defaultValue={initialValues?.title}
        />
        <TextField
          label='Категория'
          name='category'
          required
          maxLength={80}
          defaultValue={initialValues?.category}
        />
      </div>
      <TextField
        label='Описание'
        name='description'
        maxLength={400}
        isMultiline
        defaultValue={initialValues?.description}
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

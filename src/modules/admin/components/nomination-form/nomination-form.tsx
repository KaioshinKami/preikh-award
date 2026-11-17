import { useState, type FormEvent } from 'react';
import { Button, TextField } from '@/shared/components';
import type { NominationInput } from '../../model/types';
import { ImageField } from '../image-field/image-field';
import {
  readTranslations,
  TranslationFields,
  type TranslatedField,
} from '../translation-fields/translation-fields';
import styles from './nomination-form.module.scss';

const TRANSLATED_FIELDS: TranslatedField<'title' | 'category' | 'description'>[] = [
  { name: 'title', label: 'Название', maxLength: 80 },
  { name: 'category', label: 'Категория', maxLength: 80 },
  { name: 'description', label: 'Описание', maxLength: 400, isMultiline: true },
];

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
  const [isImageUploading, setIsImageUploading] = useState(false);
  // Remounts the image field after a create, so the next nomination starts without a logo.
  const [resetCount, setResetCount] = useState(0);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const imageUrl = String(formData.get('imageUrl') ?? '');
    const isSaved = await onSubmit({
      title: String(formData.get('title') ?? '').trim(),
      category: String(formData.get('category') ?? '').trim(),
      description: String(formData.get('description') ?? '').trim(),
      imageUrl: imageUrl || null,
      translations: readTranslations(formData, TRANSLATED_FIELDS),
    });
    if (isSaved && !initialValues) {
      form.reset();
      setResetCount((count) => count + 1);
    }
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
      <ImageField
        key={resetCount}
        label='Логотип номинации'
        name='imageUrl'
        defaultValue={initialValues?.imageUrl ?? null}
        shape='emblem'
        onUploadingChange={setIsImageUploading}
      />
      <TranslationFields
        key={`translations-${resetCount}`}
        fields={TRANSLATED_FIELDS}
        initialValues={initialValues?.translations}
      />
      <div className={styles.actions}>
        <Button type='submit' size='small' disabled={isSubmitting || isImageUploading}>
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

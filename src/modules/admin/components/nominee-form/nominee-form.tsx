import { useState, type FormEvent } from 'react';
import { Button, TextField } from '@/shared/components';
import type { NomineeInput } from '../../model/types';
import { ImageField } from '../image-field/image-field';
import {
  readTranslations,
  TranslationFields,
  type TranslatedField,
} from '../translation-fields/translation-fields';
import styles from './nominee-form.module.scss';

const TRANSLATED_FIELDS: TranslatedField<'name' | 'tagline'>[] = [
  { name: 'name', label: 'Имя и фамилия', maxLength: 80 },
  { name: 'tagline', label: 'Подпись', maxLength: 120 },
];

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
  const [isImageUploading, setIsImageUploading] = useState(false);
  // Remounts the photo field after an add, so the next nominee starts without a photo.
  const [resetCount, setResetCount] = useState(0);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const avatarUrl = String(formData.get('avatarUrl') ?? '');
    const isSaved = await onSubmit({
      name: String(formData.get('name') ?? '').trim(),
      tagline: String(formData.get('tagline') ?? '').trim(),
      avatarUrl: avatarUrl || null,
      translations: readTranslations(formData, TRANSLATED_FIELDS),
    });
    if (isSaved && !initialValues) {
      form.reset();
      setResetCount((count) => count + 1);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <TextField
        label='Имя и фамилия'
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
      <ImageField
        key={resetCount}
        label='Фото'
        name='avatarUrl'
        hint='Одно фото на человека: появится во всех номинациях с этим именем'
        defaultValue={initialValues?.avatarUrl ?? null}
        shape='portrait'
        onUploadingChange={setIsImageUploading}
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
      <TranslationFields
        key={`translations-${resetCount}`}
        fields={TRANSLATED_FIELDS}
        initialValues={initialValues?.translations}
      />
    </form>
  );
}

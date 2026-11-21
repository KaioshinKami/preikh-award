import { useId, useRef, useState, type ChangeEvent } from 'react';
import { getErrorMessage } from '@/shared/api/api';
import { Button } from '@/shared/components';
import { uploadImage } from '../../api/admin-api';
import { MAX_SIDE_PX, prepareImage } from '../../lib/prepare-image';
import styles from './image-field.module.scss';

type ImageFieldProps = {
  label: string;
  // The form reads the picture's URL from a hidden input with this name.
  name: string;
  defaultValue: string | null;
  shape: 'emblem' | 'portrait';
  hint?: string;
  onUploadingChange?: (isUploading: boolean) => void;
};

// The picture is uploaded as soon as it is chosen; the form then saves only its URL.
export function ImageField({
  label,
  name,
  defaultValue,
  shape,
  hint,
  onUploadingChange,
}: ImageFieldProps) {
  const labelId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState(defaultValue ?? '');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setUploading = (value: boolean) => {
    setIsUploading(value);
    onUploadingChange?.(value);
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // Lets the same file be chosen again after an error.
    event.target.value = '';
    if (!file) return;

    setError(null);
    setUploading(true);
    try {
      setUrl(await uploadImage(await prepareImage(file, MAX_SIDE_PX[shape])));
    } catch (uploadError) {
      setError(getErrorMessage(uploadError));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={styles.field} role='group' aria-labelledby={labelId}>
      <span id={labelId} className={styles.label}>
        {label}
      </span>
      <div className={styles.row}>
        <div className={styles.preview} data-shape={shape}>
          {url ? (
            <img className={styles.image} src={url} alt='' />
          ) : (
            <span className={styles.empty}>Нет картинки</span>
          )}
        </div>
        <div className={styles.controls}>
          <Button
            variant='ghost'
            size='small'
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
          >
            {isUploading ? 'Загружаем…' : url ? 'Заменить' : 'Загрузить'}
          </Button>
          {url && !isUploading && (
            <Button variant='ghost' size='small' onClick={() => setUrl('')}>
              Убрать
            </Button>
          )}
        </div>
      </div>
      {hint && <p className={styles.hint}>{hint}</p>}
      {error && (
        <p className={styles.error} role='alert'>
          {error}
        </p>
      )}
      <input
        ref={fileInputRef}
        className='visually-hidden'
        type='file'
        accept='image/jpeg,image/png,image/webp'
        tabIndex={-1}
        aria-hidden='true'
        onChange={handleFileChange}
      />
      <input type='hidden' name={name} value={url} />
    </div>
  );
}

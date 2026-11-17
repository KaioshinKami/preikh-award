import { useState } from 'react';
import { Button } from '@/shared/components';
import { deleteNominee, updateNominee } from '../../api/admin-api';
import { useAdminAction } from '../../model/use-admin-action';
import type { AdminNominee, NomineeInput } from '../../model/types';
import { NomineeForm } from '../nominee-form/nominee-form';
import styles from './nominee-editor-row.module.scss';

type NomineeEditorRowProps = {
  nominee: AdminNominee;
  onChanged: () => void;
};

export function NomineeEditorRow({ nominee, onChanged }: NomineeEditorRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const { run, isRunning, error } = useAdminAction(onChanged);

  const handleSave = async (values: NomineeInput) => {
    const isSaved = await run(() => updateNominee(nominee.id, values));
    if (isSaved) setIsEditing(false);
    return isSaved;
  };

  const handleDelete = () => {
    if (!window.confirm(`Удалить номинанта «${nominee.name}»?`)) return;
    void run(() => deleteNominee(nominee.id));
  };

  return (
    <li className={styles.row}>
      {isEditing ? (
        <NomineeForm
          initialValues={nominee}
          submitLabel='Сохранить'
          isSubmitting={isRunning}
          onSubmit={handleSave}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <div className={styles.summary}>
          {nominee.avatarUrl ? (
            <img className={styles.photo} src={nominee.avatarUrl} alt='' />
          ) : (
            <span className={styles.photo} aria-hidden='true' />
          )}
          <div className={styles.text}>
            <span className={styles.name}>{nominee.name}</span>
            {nominee.tagline && <span className={styles.tagline}>{nominee.tagline}</span>}
          </div>
          <span className={styles.votes}>{nominee.votes} гол.</span>
          <div className={styles.actions}>
            <Button variant='ghost' size='small' onClick={() => setIsEditing(true)}>
              Изменить
            </Button>
            <Button variant='danger' size='small' disabled={isRunning} onClick={handleDelete}>
              Удалить
            </Button>
          </div>
        </div>
      )}
      {error && (
        <p className={styles.error} role='alert'>
          {error}
        </p>
      )}
    </li>
  );
}

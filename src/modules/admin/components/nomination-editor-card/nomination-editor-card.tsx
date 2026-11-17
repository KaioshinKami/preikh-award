import { useState } from 'react';
import { Button } from '@/shared/components';
import { createNominee, deleteNomination, updateNomination } from '../../api/admin-api';
import { useAdminAction } from '../../model/use-admin-action';
import type { AdminNomination, NominationInput, NomineeInput } from '../../model/types';
import { NominationForm } from '../nomination-form/nomination-form';
import { NomineeEditorRow } from '../nominee-editor-row/nominee-editor-row';
import { NomineeForm } from '../nominee-form/nominee-form';
import styles from './nomination-editor-card.module.scss';

type NominationEditorCardProps = {
  nomination: AdminNomination;
  onChanged: () => void;
};

export function NominationEditorCard({ nomination, onChanged }: NominationEditorCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const { run, isRunning, error } = useAdminAction(onChanged);

  const handleSave = async (values: NominationInput) => {
    const isSaved = await run(() => updateNomination(nomination.id, values));
    if (isSaved) setIsEditing(false);
    return isSaved;
  };

  const handleDelete = () => {
    if (!window.confirm(`Удалить номинацию «${nomination.title}» вместе с номинантами?`)) return;
    void run(() => deleteNomination(nomination.id));
  };

  const handleAddNominee = (values: NomineeInput) =>
    run(() => createNominee(nomination.id, values));

  return (
    <article className={styles.card}>
      {isEditing ? (
        <NominationForm
          initialValues={nomination}
          submitLabel='Сохранить'
          isSubmitting={isRunning}
          onSubmit={handleSave}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <header className={styles.header}>
          {nomination.imageUrl && <img className={styles.logo} src={nomination.imageUrl} alt='' />}
          <div className={styles.headerText}>
            <p className={styles.category}>{nomination.category}</p>
            <h3 className={styles.title}>«{nomination.title}»</h3>
            {nomination.description && (
              <p className={styles.description}>{nomination.description}</p>
            )}
          </div>
          <div className={styles.actions}>
            <Button variant='ghost' size='small' onClick={() => setIsEditing(true)}>
              Изменить
            </Button>
            <Button variant='danger' size='small' disabled={isRunning} onClick={handleDelete}>
              Удалить
            </Button>
          </div>
        </header>
      )}

      {error && (
        <p className={styles.error} role='alert'>
          {error}
        </p>
      )}

      <ul className={styles.nominees}>
        {nomination.nominees.map((nominee) => (
          <NomineeEditorRow key={nominee.id} nominee={nominee} onChanged={onChanged} />
        ))}
      </ul>

      <div className={styles.addNominee}>
        <p className={styles.addTitle}>Новый номинант</p>
        <NomineeForm submitLabel='Добавить' isSubmitting={isRunning} onSubmit={handleAddNominee} />
      </div>
    </article>
  );
}

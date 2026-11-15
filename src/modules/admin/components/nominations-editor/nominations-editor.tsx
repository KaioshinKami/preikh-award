import { useState } from 'react';
import { Button } from '@/shared/components';
import { useAsyncData } from '@/shared/hooks/use-async-data';
import { createNomination, fetchAdminNominations } from '../../api/admin-api';
import { useAdminAction } from '../../model/use-admin-action';
import type { NominationInput } from '../../model/types';
import { AdminPanel } from '../admin-panel/admin-panel';
import { NominationEditorCard } from '../nomination-editor-card/nomination-editor-card';
import { NominationForm } from '../nomination-form/nomination-form';
import styles from './nominations-editor.module.scss';

export function NominationsEditor() {
  const { data: nominations, error: loadError, reload } = useAsyncData(fetchAdminNominations, []);
  const { run, isRunning, error: createError } = useAdminAction(reload);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async (values: NominationInput) => {
    const isCreated = await run(() => createNomination(values));
    if (isCreated) setIsCreating(false);
    return isCreated;
  };

  const addButton = (
    <Button size='small' onClick={() => setIsCreating(true)} disabled={isCreating}>
      Добавить номинацию
    </Button>
  );

  return (
    <AdminPanel title='Номинации и номинанты' actions={addButton} error={loadError ?? createError}>
      {isCreating && (
        <div className={styles.createForm}>
          <NominationForm
            submitLabel='Создать'
            isSubmitting={isRunning}
            onSubmit={handleCreate}
            onCancel={() => setIsCreating(false)}
          />
        </div>
      )}
      <div className={styles.list}>
        {nominations?.map((nomination) => (
          <NominationEditorCard key={nomination.id} nomination={nomination} onChanged={reload} />
        ))}
      </div>
    </AdminPanel>
  );
}

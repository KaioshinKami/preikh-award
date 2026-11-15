import { useState, type FormEvent } from 'react';
import { useAuth } from '@/modules/auth';
import { getErrorMessage } from '@/shared/api/api';
import { Button, Reveal, SelectField, TextField } from '@/shared/components';
import { submitApplication } from '../../api/nominations-api';
import type { Nomination } from '../../model/types';
import styles from './application-form.module.scss';

type ApplicationFormProps = {
  nominations: Nomination[];
};

type FormMessage = { tone: 'success' | 'error'; text: string };

const MIN_NOMINEE_NAME_LENGTH = 2;

export function ApplicationForm({ nominations }: ApplicationFormProps) {
  const { user, openAuthDialog } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<FormMessage | null>(null);
  const nominationOptions = nominations.map((nomination) => ({
    value: String(nomination.id),
    label: `«${nomination.title}» — ${nomination.category}`,
  }));

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const nomineeName = String(formData.get('nomineeName') ?? '').trim();
    if (nomineeName.length < MIN_NOMINEE_NAME_LENGTH) {
      setMessage({ tone: 'error', text: 'Укажите имя номинанта — минимум 2 символа' });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);
    try {
      await submitApplication({
        nominationId: Number(formData.get('nominationId')),
        nomineeName,
        comment: String(formData.get('comment') ?? '').trim(),
      });
      form.reset();
      setMessage({ tone: 'success', text: 'Заявка отправлена — модератор скоро её проверит.' });
    } catch (error) {
      setMessage({ tone: 'error', text: getErrorMessage(error) });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (nominations.length === 0) return null;

  return (
    <Reveal className={styles.wrapper}>
      <div className={styles.intro}>
        <h3 className={styles.title}>Предложить номинанта</h3>
        <p className={styles.lead}>
          Не нашли своего кандидата? Предложите его — заявку проверит комиссия.
        </p>
      </div>

      {!user && (
        <div className={styles.guest}>
          <p>Войдите, чтобы отправить заявку.</p>
          <Button variant='ghost' onClick={() => openAuthDialog('login')}>
            Войти
          </Button>
        </div>
      )}

      {user && (
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <SelectField label='Номинация' name='nominationId' options={nominationOptions} />
          <TextField label='Кого предлагаете' name='nomineeName' maxLength={80} required />
          <TextField label='Почему (необязательно)' name='comment' maxLength={500} isMultiline />
          {message && (
            <p className={styles.message} data-tone={message.tone} role='status'>
              {message.text}
            </p>
          )}
          <Button type='submit' disabled={isSubmitting} className={styles.submit}>
            Отправить заявку
          </Button>
        </form>
      )}
    </Reveal>
  );
}

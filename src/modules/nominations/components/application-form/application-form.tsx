import { useState, type FormEvent } from 'react';
import { useAuth } from '@/modules/auth';
import { getErrorMessage } from '@/shared/api/api';
import { Button, Reveal, SelectField, TextField } from '@/shared/components';
import { useLocale, useMessages } from '@/shared/i18n';
import { submitApplication } from '../../api/nominations-api';
import { localize, NOMINATION_FIELDS } from '../../lib/localize';
import { NOMINATIONS_MESSAGES } from '../../model/nominations-messages';
import type { Nomination } from '../../model/types';
import styles from './application-form.module.scss';

type ApplicationFormProps = {
  nominations: Nomination[];
};

type FormMessage = { tone: 'success' | 'error'; text: string };

const MIN_NOMINEE_NAME_LENGTH = 2;

export function ApplicationForm({ nominations }: ApplicationFormProps) {
  const t = useMessages(NOMINATIONS_MESSAGES).application;
  const locale = useLocale();
  const { user, openAuthDialog } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<FormMessage | null>(null);
  const nominationOptions = nominations.map((nomination) => {
    const { title, category } = localize(nomination, NOMINATION_FIELDS, locale);
    return { value: String(nomination.id), label: t.nominationOption(title, category) };
  });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const nomineeName = String(formData.get('nomineeName') ?? '').trim();
    if (nomineeName.length < MIN_NOMINEE_NAME_LENGTH) {
      setMessage({ tone: 'error', text: t.nameTooShort(MIN_NOMINEE_NAME_LENGTH) });
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
      setMessage({ tone: 'success', text: t.sent });
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
        <h3 className={styles.title}>{t.title}</h3>
        <p className={styles.lead}>{t.lead}</p>
      </div>

      {!user && (
        <div className={styles.guest}>
          <p>{t.guest}</p>
          <Button variant='ghost' onClick={() => openAuthDialog('login')}>
            {t.signIn}
          </Button>
        </div>
      )}

      {user && (
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <SelectField label={t.nomination} name='nominationId' options={nominationOptions} />
          <TextField label={t.nominee} name='nomineeName' maxLength={80} required />
          <TextField label={t.comment} name='comment' maxLength={500} isMultiline />
          {message && (
            <p className={styles.message} data-tone={message.tone} role='status'>
              {message.text}
            </p>
          )}
          <Button type='submit' disabled={isSubmitting} className={styles.submit}>
            {t.submit}
          </Button>
        </form>
      )}
    </Reveal>
  );
}

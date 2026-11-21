import { useState, type FormEvent } from 'react';
import { useAuth } from '@/modules/auth';
import { getErrorMessage } from '@/shared/api/api';
import { Button, TextField } from '@/shared/components';
import { useMessages } from '@/shared/i18n';
import { submitApplication } from '../../api/nominations-api';
import { NOMINATIONS_MESSAGES } from '../../model/nominations-messages';
import { useVariants } from '../../model/use-variants';
import { VariantsList } from '../variants-list/variants-list';
import styles from './own-variant-form.module.scss';

type OwnVariantFormProps = {
  nominationId: number;
};

type FormMessage = { tone: 'success' | 'error'; text: string };

// The API's limits for a suggested nominee.
const MIN_LENGTH = 2;
const MAX_LENGTH = 80;

// At the bottom of a nomination page: anyone signed in can write in their own pick for this
// nomination, voted or not, and support the picks of others. Picks arrive in the admin page as
// suggestions for the commission, with the number of people behind each one.
export function OwnVariantForm({ nominationId }: OwnVariantFormProps) {
  const t = useMessages(NOMINATIONS_MESSAGES).ownVariant;
  const { user, openAuthDialog } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<FormMessage | null>(null);
  const {
    variants,
    error: variantsError,
    pendingId,
    reload,
    toggleSupport,
  } = useVariants(nominationId);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const variant = String(new FormData(form).get('variant') ?? '').trim();
    if (variant.length < MIN_LENGTH) {
      setMessage({ tone: 'error', text: t.tooShort(MIN_LENGTH) });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);
    try {
      const { status } = await submitApplication({
        nominationId,
        nomineeName: variant,
        comment: '',
      });
      form.reset();
      setMessage({ tone: 'success', text: status === 'supported' ? t.merged : t.sent });
      reload();
    } catch (error) {
      setMessage({ tone: 'error', text: getErrorMessage(error) });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className={styles.wrapper} aria-labelledby={`own-variant-${nominationId}`}>
      <div className={styles.intro}>
        <h2 id={`own-variant-${nominationId}`} className={styles.title}>
          {t.title}
        </h2>
        <p className={styles.lead}>{t.lead}</p>
      </div>

      {user ? (
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.row}>
            <TextField
              label={t.label}
              name='variant'
              placeholder={t.placeholder}
              maxLength={MAX_LENGTH}
              autoComplete='off'
              required
            />
            <Button type='submit' disabled={isSubmitting} className={styles.submit}>
              {t.submit}
            </Button>
          </div>
          {message && (
            <p className={styles.message} data-tone={message.tone} role='status'>
              {message.text}
            </p>
          )}
        </form>
      ) : (
        <div className={styles.guest}>
          <p>{t.guest}</p>
          <Button variant='ghost' onClick={() => openAuthDialog('login')}>
            {t.signIn}
          </Button>
        </div>
      )}

      {variants && (
        <VariantsList
          variants={variants}
          pendingId={pendingId}
          onToggleSupport={(chosen) => void toggleSupport(chosen)}
        />
      )}
      {variantsError && (
        <p className={styles.message} data-tone='error' role='alert'>
          {variantsError}
        </p>
      )}
    </section>
  );
}

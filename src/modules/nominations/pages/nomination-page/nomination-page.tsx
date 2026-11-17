import { useEffect } from 'react';
import { useLocale, useMessages } from '@/shared/i18n';
import { handleLinkClick } from '@/shared/lib/navigation';
import { useNominations } from '../../api/use-nominations';
import { NominationEmblem } from '../../components/nomination-emblem/nomination-emblem';
import { NominationsStatus } from '../../components/nominations-status/nominations-status';
import { NomineeCard } from '../../components/nominee-card/nominee-card';
import { getVoteResults, getVoteStatus } from '../../lib/get-vote-results';
import { localize, NOMINATION_FIELDS } from '../../lib/localize';
import { getNominationAnchorId, getNominationPath } from '../../lib/nomination-path';
import { NOMINATIONS_MESSAGES } from '../../model/nominations-messages';
import type { Nomination } from '../../model/types';
import { useVotes } from '../../model/use-votes';
import styles from './nomination-page.module.scss';

type NominationPageProps = {
  nominationId: number;
};

function useDocumentTitle(title: string | null) {
  useEffect(() => {
    if (!title) return;
    const previousTitle = document.title;
    document.title = title;
    return () => {
      document.title = previousTitle;
    };
  }, [title]);
}

type PagerLinkProps = {
  nomination: Nomination;
  direction: 'previous' | 'next';
};

function PagerLink({ nomination, direction }: PagerLinkProps) {
  const t = useMessages(NOMINATIONS_MESSAGES).page;
  const { title } = localize(nomination, NOMINATION_FIELDS, useLocale());

  return (
    <a
      className={styles.pagerLink}
      data-direction={direction}
      href={getNominationPath(nomination.id)}
      onClick={handleLinkClick}
    >
      <span className={styles.pagerLabel}>{direction === 'previous' ? t.previous : t.next}</span>
      <span className={styles.pagerTitle}>{title}</span>
    </a>
  );
}

export function NominationPage({ nominationId }: NominationPageProps) {
  const t = useMessages(NOMINATIONS_MESSAGES);
  const locale = useLocale();
  const { data, error, reload } = useNominations();
  const { votes, pendingNomineeId, voteError, castVote } = useVotes();
  const nominations = data?.nominations ?? [];
  const index = nominations.findIndex((nomination) => nomination.id === nominationId);
  const nomination = nominations[index];
  const texts = nomination ? localize(nomination, NOMINATION_FIELDS, locale) : null;
  useDocumentTitle(texts ? `${texts.title} — PREIKH AWARD` : null);

  const previousNomination = nominations[index - 1];
  const nextNomination = index === -1 ? undefined : nominations[index + 1];
  const results = nomination ? getVoteResults(nomination.nominees) : null;

  return (
    <section className={styles.page}>
      <div className={styles.inner}>
        <a
          className={styles.back}
          href={`/#${getNominationAnchorId(nominationId)}`}
          onClick={handleLinkClick}
        >
          {t.page.back}
        </a>

        {!data && !error && <NominationsStatus message={t.page.loading} />}
        {!data && error && <NominationsStatus message={error} onRetry={reload} />}
        {data && !nomination && <p className={styles.notice}>{t.page.notFound}</p>}

        {data && nomination && texts && (
          <>
            <header className={styles.header}>
              <NominationEmblem imageUrl={nomination.imageUrl} className={styles.emblem} />
              <div className={styles.headerText}>
                <p className={styles.meta}>
                  <span>{texts.category}</span>
                  <span className={styles.counter}>
                    {index + 1} / {nominations.length}
                  </span>
                </p>
                <h1 className={styles.title}>{texts.title}</h1>
                {texts.description && <p className={styles.description}>{texts.description}</p>}
              </div>
            </header>

            {!data.votingOpen && <p className={styles.notice}>{t.votingClosed}</p>}
            {voteError && (
              <p className={styles.error} role='alert'>
                {voteError}
              </p>
            )}

            <h2 className='visually-hidden'>{t.page.nominees}</h2>
            {nomination.nominees.length === 0 ? (
              <p className={styles.notice}>{t.page.nomineesSoon}</p>
            ) : (
              <ul className={styles.nominees}>
                {nomination.nominees.map((nominee) => (
                  <li key={nominee.id} className={styles.nominee}>
                    <NomineeCard
                      nominee={nominee}
                      result={results?.get(nominee.id)}
                      voteStatus={getVoteStatus({
                        nomineeId: nominee.id,
                        votedNomineeId: votes[nomination.id],
                        pendingNomineeId,
                        isVotingOpen: data.votingOpen,
                      })}
                      onVote={(chosen, displayName) =>
                        void castVote(nomination.id, chosen, displayName)
                      }
                    />
                  </li>
                ))}
              </ul>
            )}

            <nav className={styles.pager} aria-label={t.page.otherNominations}>
              {previousNomination && (
                <PagerLink nomination={previousNomination} direction='previous' />
              )}
              {nextNomination && <PagerLink nomination={nextNomination} direction='next' />}
            </nav>
          </>
        )}
      </div>
    </section>
  );
}

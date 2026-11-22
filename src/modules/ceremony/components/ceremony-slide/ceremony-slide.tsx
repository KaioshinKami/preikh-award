import type { CSSProperties } from 'react';
import { formatVotes, NominationEmblem, NomineePhoto } from '@/modules/nominations';
import { IceLoader } from '@/shared/components';
import { rankNominees } from '../../lib/ceremony-steps';
import type { CeremonyNomination, CeremonyStep, Place } from '../../model/types';
import styles from './ceremony-slide.module.scss';

type CeremonySlideProps = {
  step: CeremonyStep;
  nominations: CeremonyNomination[];
};

const percent = (share: number) => `${Math.round(share * 100)}%`;
const votesLine = (place: Place) => `${formatVotes(place.votes)} · ${percent(place.share)}`;

// Each element after the first appears a moment later than the one before.
const stagger = (index: number, stepMs = 120): CSSProperties => ({
  animationDelay: `${index * stepMs}ms`,
});

function Brand({ caption }: { caption: string }) {
  return (
    <>
      <h1 className={styles.brand}>PAWARDS</h1>
      <p className={styles.brandCaption}>{caption}</p>
    </>
  );
}

function NominationHeading({ nomination }: { nomination: CeremonyNomination }) {
  return (
    <div className={styles.heading}>
      <NominationEmblem imageUrl={nomination.imageUrl} className={styles.headingEmblem} />
      <p className={styles.headingTitle}>{nomination.title}</p>
    </div>
  );
}

function NominationSlide({
  nomination,
  number,
  total,
}: {
  nomination: CeremonyNomination;
  number: number;
  total: number;
}) {
  const hasVotes = nomination.nominees.some((nominee) => nominee.votes > 0);
  return (
    <div className={styles.nomination}>
      <NominationEmblem imageUrl={nomination.imageUrl} className={styles.bigEmblem} />
      <p className={styles.eyebrow}>
        Номинация {number} из {total}
        {nomination.category && ` · ${nomination.category}`}
      </p>
      <h1 className={styles.title}>{nomination.title}</h1>
      {nomination.description && <p className={styles.description}>{nomination.description}</p>}
      <ul className={styles.nominees} data-count={Math.min(nomination.nominees.length, 10)}>
        {nomination.nominees.map((nominee, index) => (
          <li key={nominee.id} className={styles.nominee} style={stagger(index + 3)}>
            <NomineePhoto
              name={nominee.name}
              avatarUrl={nominee.avatarUrl}
              className={styles.nomineePhoto}
            />
            <span className={styles.nomineeName}>{nominee.name}</span>
          </li>
        ))}
      </ul>
      {!hasVotes && <p className={styles.note}>В этой номинации никто не проголосовал</p>}
    </div>
  );
}

function SuspenseSlide({ nomination }: { nomination: CeremonyNomination }) {
  return (
    <div className={styles.suspense}>
      <NominationHeading nomination={nomination} />
      <p className={styles.suspenseText}>
        И победитель
        <span className={styles.dots} aria-hidden='true'>
          <span>.</span>
          <span>.</span>
          <span>.</span>
        </span>
      </p>
      <IceLoader className={styles.suspenseLoader} />
    </div>
  );
}

function WinnerSlide({ nomination }: { nomination: CeremonyNomination }) {
  const [first] = rankNominees(nomination.nominees);
  const isTie = first.nominees.length > 1;
  return (
    <div className={styles.winner}>
      <NominationHeading nomination={nomination} />
      <p className={styles.winnerLabel}>{isTie ? 'Ничья! Победители' : 'Победитель'}</p>
      <ul className={styles.winners} data-count={Math.min(first.nominees.length, 4)}>
        {first.nominees.map((nominee, index) => (
          <li key={nominee.id} className={styles.winnerCard} style={stagger(index, 250)}>
            <div className={styles.winnerPhotoWrap}>
              <span className={styles.burst} aria-hidden='true'>
                {Array.from({ length: 12 }, (_, sparkle) => (
                  <span key={sparkle} style={{ '--turn': `${sparkle * 30}deg` } as CSSProperties} />
                ))}
              </span>
              <NomineePhoto
                name={nominee.name}
                avatarUrl={nominee.avatarUrl}
                className={styles.winnerPhoto}
              />
            </div>
            <p className={styles.winnerName}>{nominee.name}</p>
          </li>
        ))}
      </ul>
      <p className={styles.winnerVotes}>{votesLine(first)}</p>
    </div>
  );
}

function PlacesSlide({ nomination }: { nomination: CeremonyNomination }) {
  const rows = rankNominees(nomination.nominees)
    .slice(1)
    .flatMap((place) => place.nominees.map((nominee) => ({ place, nominee })));
  return (
    <div className={styles.places}>
      <NominationHeading nomination={nomination} />
      <p className={styles.placesLabel}>Остальные места</p>
      <ol className={styles.placeList} data-columns={rows.length > 5 ? 2 : 1}>
        {rows.map(({ place, nominee }, index) => (
          <li
            key={nominee.id}
            className={styles.placeRow}
            data-place={Math.min(place.place, 4)}
            style={stagger(index, 160)}
          >
            <span className={styles.placeNumber}>{place.place}</span>
            <NomineePhoto
              name={nominee.name}
              avatarUrl={nominee.avatarUrl}
              className={styles.placePhoto}
            />
            <span className={styles.placeName}>{nominee.name}</span>
            <span className={styles.placeVotes}>{votesLine(place)}</span>
            <span className={styles.placeBar} aria-hidden='true'>
              <span style={{ width: percent(place.share) }} />
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

// One full-screen slide of the ceremony.
export function CeremonySlide({ step, nominations }: CeremonySlideProps) {
  if (step.kind === 'opening') {
    return (
      <div className={styles.opening}>
        <IceLoader className={styles.openingMark} />
        <Brand caption='Церемония награждения · PREIKH AWARD 2026' />
        <p className={styles.hint}>Нажмите «Дальше», пробел или стрелку вправо</p>
      </div>
    );
  }

  if (step.kind === 'closing') {
    return (
      <div className={styles.opening}>
        <IceLoader className={styles.openingMark} />
        <Brand caption='Спасибо, что были с нами! До встречи на следующей премии' />
      </div>
    );
  }

  const nomination = nominations[step.nomination];
  if (step.kind === 'nomination') {
    return (
      <NominationSlide
        nomination={nomination}
        number={step.nomination + 1}
        total={nominations.length}
      />
    );
  }
  if (step.kind === 'suspense') return <SuspenseSlide nomination={nomination} />;
  if (step.kind === 'winner') return <WinnerSlide nomination={nomination} />;
  return <PlacesSlide nomination={nomination} />;
}

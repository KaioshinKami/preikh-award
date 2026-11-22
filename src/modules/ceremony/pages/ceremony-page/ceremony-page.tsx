import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent } from 'react';
import { Snowfall } from '@/modules/layout';
import { getErrorMessage } from '@/shared/api/api';
import { Button, IceLoader } from '@/shared/components';
import { fetchCeremonyNominations } from '../../api/ceremony-api';
import { CeremonySlide } from '../../components/ceremony-slide/ceremony-slide';
import { buildCeremonySteps, ceremonyNominations } from '../../lib/ceremony-steps';
import { CeremonySounds } from '../../lib/ceremony-sounds';
import type { CeremonyNomination } from '../../model/types';
import styles from './ceremony-page.module.scss';

type CeremonyPageProps = {
  onExit: () => void;
};

// The drum roll under "And the winner is…", after which the winner appears by itself.
const SUSPENSE_SECONDS = 3.2;
const CONTROLS_HIDE_MS = 2500;
// Where the ceremony is, so reloading the page by accident doesn't start it over.
const STEP_KEY = 'preikh-ceremony-step';
const NEXT_KEYS = new Set(['ArrowRight', 'ArrowDown', 'PageDown', ' ', 'Enter']);
const BACK_KEYS = new Set(['ArrowLeft', 'ArrowUp', 'PageUp', 'Backspace']);
// F, and the same key on a Russian keyboard.
const FULLSCREEN_KEYS = new Set(['f', 'F', 'а', 'А']);

function readSavedStep(): number {
  try {
    return Number(window.sessionStorage.getItem(STEP_KEY)) || 0;
  } catch {
    return 0;
  }
}

function saveStep(step: number): void {
  try {
    window.sessionStorage.setItem(STEP_KEY, String(step));
  } catch {
    // Without storage a reload simply starts from the beginning.
  }
}

function toggleFullscreen(): void {
  if (document.fullscreenElement) void document.exitFullscreen();
  else void document.documentElement.requestFullscreen?.().catch(() => {});
}

// The ceremony on a big screen: each "Next" shows a nomination, then "And the winner is…" with a
// drum roll, then the winner in the snow, then the other places. Admins only: the page sits in
// the admin area, and the vote counts come from the admin API.
export function CeremonyPage({ onExit }: CeremonyPageProps) {
  const [nominations, setNominations] = useState<CeremonyNomination[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reloadCount, setReloadCount] = useState(0);
  const [stepIndex, setStepIndex] = useState(readSavedStep);
  const [isSoundOn, setIsSoundOn] = useState(true);
  const [areControlsShown, setAreControlsShown] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const soundsRef = useRef<CeremonySounds | null>(null);
  const previousStepRef = useRef(stepIndex);

  useEffect(() => {
    let isCurrent = true;
    fetchCeremonyNominations().then(
      (loaded) => isCurrent && setNominations(loaded),
      (loadError: unknown) => isCurrent && setError(getErrorMessage(loadError)),
    );
    return () => {
      isCurrent = false;
    };
  }, [reloadCount]);

  const shown = useMemo(() => (nominations ? ceremonyNominations(nominations) : []), [nominations]);
  const steps = useMemo(() => buildCeremonySteps(shown), [shown]);
  const current = Math.min(stepIndex, steps.length - 1);
  const step = steps[current];

  const getSounds = () => (soundsRef.current ??= new CeremonySounds());

  // Called from clicks and key presses, which is also when the browser allows sound to start.
  const goTo = useCallback(
    (index: number) => {
      getSounds().unlock();
      setStepIndex(Math.max(0, Math.min(index, steps.length - 1)));
    },
    [steps.length],
  );
  const goNext = useCallback(() => goTo(current + 1), [goTo, current]);
  const goBack = useCallback(() => goTo(current - 1), [goTo, current]);

  useEffect(() => saveStep(current), [current]);

  // Drum roll when "And the winner is…" comes up, the cymbal when the winner follows it.
  // Going back replays nothing.
  useEffect(() => {
    const previous = previousStepRef.current;
    previousStepRef.current = current;
    const sounds = soundsRef.current;
    if (!sounds) return;
    if (step.kind !== 'suspense' || !isSoundOn) sounds.stopDrumroll();
    if (!isSoundOn || current !== previous + 1) return;
    if (step.kind === 'suspense') sounds.drumroll(SUSPENSE_SECONDS);
    if (step.kind === 'winner') sounds.reveal();
  }, [current, step, isSoundOn]);

  useEffect(() => {
    if (step.kind !== 'suspense') return;
    const timer = window.setTimeout(
      () => setStepIndex((index) => (index === current ? index + 1 : index)),
      SUSPENSE_SECONDS * 1000,
    );
    return () => window.clearTimeout(timer);
  }, [current, step]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (target.closest('select')) return;
      // Space and Enter on a focused button press that button instead.
      if (target.closest('button') && (event.key === ' ' || event.key === 'Enter')) return;
      if (NEXT_KEYS.has(event.key)) {
        event.preventDefault();
        goNext();
      } else if (BACK_KEYS.has(event.key)) {
        event.preventDefault();
        goBack();
      } else if (event.key === 'Home') {
        goTo(0);
      } else if (FULLSCREEN_KEYS.has(event.key)) {
        toggleFullscreen();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [goNext, goBack, goTo]);

  // The buttons fade away while the mouse is still, so only the slide is on the big screen.
  useEffect(() => {
    let timer = window.setTimeout(() => setAreControlsShown(false), CONTROLS_HIDE_MS);
    const show = () => {
      setAreControlsShown(true);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setAreControlsShown(false), CONTROLS_HIDE_MS);
    };
    window.addEventListener('mousemove', show);
    window.addEventListener('touchstart', show);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('mousemove', show);
      window.removeEventListener('touchstart', show);
    };
  }, []);

  useEffect(() => {
    const update = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', update);
    return () => document.removeEventListener('fullscreenchange', update);
  }, []);

  useEffect(() => () => soundsRef.current?.close(), []);

  const exit = () => {
    if (document.fullscreenElement) void document.exitFullscreen();
    onExit();
  };

  if (!nominations) {
    return (
      <div className={styles.page}>
        <div className={styles.status}>
          {error ? (
            <>
              <p>{error}</p>
              <div className={styles.statusActions}>
                <Button onClick={() => (setError(null), setReloadCount((count) => count + 1))}>
                  Попробовать снова
                </Button>
                <Button variant='ghost' onClick={exit}>
                  Выйти
                </Button>
              </div>
            </>
          ) : (
            <IceLoader className={styles.loader} label='Загружаем результаты' />
          )}
        </div>
      </div>
    );
  }

  // The first slide of each nomination, for jumping straight to it.
  const nominationStarts = steps.flatMap((item, index) =>
    item.kind === 'nomination' ? [{ index, title: shown[item.nomination].title }] : [],
  );
  const handleStageClick = (event: MouseEvent) => {
    if (event.button === 0) goNext();
  };

  return (
    <div className={styles.page} data-controls={areControlsShown}>
      <Snowfall />
      <main className={styles.stage} onClick={handleStageClick}>
        <div key={current} className={styles.slide}>
          <CeremonySlide step={step} nominations={shown} />
        </div>
      </main>

      {/* After a mouse click the button lets go of the focus, so the clicker's keys go back to
          the slides instead of pressing that button again. */}
      <nav
        className={styles.controls}
        aria-label='Управление церемонией'
        onClick={(event) => {
          if (event.detail > 0) (event.target as HTMLElement).closest('button')?.blur();
        }}
      >
        <Button variant='ghost' size='small' onClick={goBack} disabled={current === 0}>
          ← Назад
        </Button>
        <select
          className={styles.jump}
          aria-label='Перейти к номинации'
          value=''
          onChange={(event) => {
            goTo(Number(event.target.value));
            event.target.blur();
          }}
        >
          <option value='' disabled>
            {current + 1} / {steps.length} · перейти…
          </option>
          <option value={0}>Начало</option>
          {nominationStarts.map((item, number) => (
            <option key={item.index} value={item.index}>
              {number + 1}. {item.title}
            </option>
          ))}
        </select>
        <Button size='small' onClick={goNext} disabled={current === steps.length - 1}>
          Дальше →
        </Button>
        <Button
          variant='ghost'
          size='small'
          onClick={() => setIsSoundOn((isOn) => !isOn)}
          aria-pressed={isSoundOn}
        >
          {isSoundOn ? 'Звук вкл.' : 'Звук выкл.'}
        </Button>
        <Button variant='ghost' size='small' onClick={toggleFullscreen}>
          {isFullscreen ? 'Свернуть' : 'Во весь экран'}
        </Button>
        <Button variant='ghost' size='small' onClick={exit}>
          Выйти
        </Button>
      </nav>
    </div>
  );
}

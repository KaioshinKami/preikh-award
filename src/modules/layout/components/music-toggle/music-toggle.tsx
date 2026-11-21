import { useCallback, useEffect, useRef, useState } from 'react';
import { defineMessages, useMessages } from '@/shared/i18n';
import { MusicBox } from '../../lib/music/music-box';
import styles from './music-toggle.module.scss';

const MESSAGES = defineMessages({
  ru: {
    turnOn: 'Включить новогоднюю музыку',
    turnOff: 'Выключить музыку',
    hint: 'Включить новогоднюю музыку?',
  },
  kk: {
    turnOn: 'Жаңа жылдық музыканы қосу',
    turnOff: 'Музыканы өшіру',
    hint: 'Жаңа жылдық музыканы қосасыз ба?',
  },
  en: {
    turnOn: 'Play New Year music',
    turnOff: 'Turn the music off',
    hint: 'Play some New Year music?',
  },
});

// The visitor's last choice, so the music stays on (or off) on their next visit.
const STORAGE_KEY = 'preikh-music';
type MusicChoice = 'on' | 'off';

function readChoice(): MusicChoice | null {
  try {
    const choice = window.localStorage.getItem(STORAGE_KEY);
    return choice === 'on' || choice === 'off' ? choice : null;
  } catch {
    return null;
  }
}

function saveChoice(choice: MusicChoice): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, choice);
  } catch {
    // Private mode or blocked storage: the choice just isn't remembered.
  }
}

function NoteIcon() {
  return (
    <svg viewBox='0 0 24 24' aria-hidden='true' focusable='false'>
      <path d='M9 18V5l12-2v13' />
      <circle cx='6' cy='18' r='3' />
      <circle cx='18' cy='16' r='3' />
    </svg>
  );
}

function PlayingIcon() {
  return (
    <span className={styles.bars} aria-hidden='true'>
      <span />
      <span />
      <span />
      <span />
    </span>
  );
}

// A round button in the corner of every public page. Off until the visitor turns it on; the
// music then plays across pages and goes quiet while the tab is in the background.
export function MusicToggle() {
  const t = useMessages(MESSAGES);
  const boxRef = useRef<MusicBox | null>(null);
  const cancelAutoStartRef = useRef<(() => void) | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showHint, setShowHint] = useState(() => readChoice() === null);

  const getBox = () => (boxRef.current ??= new MusicBox());

  const start = useCallback(() => {
    (boxRef.current ??= new MusicBox()).play();
    setIsPlaying(true);
    setShowHint(false);
  }, []);

  // Someone who left the music on hears it again from their first click or key press here:
  // browsers only allow sound once the visitor has done something on the page.
  useEffect(() => {
    if (readChoice() !== 'on') return;
    const startOnce = () => {
      cancel();
      start();
    };
    const cancel = () => {
      window.removeEventListener('click', startOnce, true);
      window.removeEventListener('keydown', startOnce, true);
      cancelAutoStartRef.current = null;
    };
    window.addEventListener('click', startOnce, true);
    window.addEventListener('keydown', startOnce, true);
    cancelAutoStartRef.current = cancel;
    return cancel;
  }, [start]);

  useEffect(() => {
    if (!isPlaying) return;
    const followTab = () => (document.hidden ? boxRef.current?.pause() : boxRef.current?.play());
    document.addEventListener('visibilitychange', followTab);
    return () => document.removeEventListener('visibilitychange', followTab);
  }, [isPlaying]);

  useEffect(() => () => boxRef.current?.close(), []);

  if (!MusicBox.isSupported()) return null;

  const handleClick = () => {
    cancelAutoStartRef.current?.();
    if (isPlaying) {
      getBox().pause();
      setIsPlaying(false);
      saveChoice('off');
    } else {
      start();
      saveChoice('on');
    }
    setShowHint(false);
  };

  const label = isPlaying ? t.turnOff : t.turnOn;

  return (
    <div className={styles.music}>
      {showHint && (
        <p className={styles.hint} aria-hidden='true'>
          {t.hint}
        </p>
      )}
      <button
        type='button'
        className={styles.button}
        data-playing={isPlaying}
        aria-pressed={isPlaying}
        aria-label={label}
        title={label}
        onClick={handleClick}
      >
        {isPlaying ? <PlayingIcon /> : <NoteIcon />}
      </button>
    </div>
  );
}

import { useEffect, useRef, useState } from 'react';
import { defineMessages, useMessages } from '@/shared/i18n';
import { MusicBox } from '../../lib/music/music-box';
import styles from './music-toggle.module.scss';

const MESSAGES = defineMessages({
  ru: {
    turnOn: 'Включить новогоднюю музыку',
    turnOff: 'Выключить музыку',
    hint: 'Нажмите в любом месте — заиграет музыка',
  },
  kk: {
    turnOn: 'Жаңа жылдық музыканы қосу',
    turnOff: 'Музыканы өшіру',
    hint: 'Кез келген жерді басыңыз — музыка ойнайды',
  },
  en: {
    turnOn: 'Play New Year music',
    turnOff: 'Turn the music off',
    hint: 'Tap anywhere and the music starts',
  },
});

// Only an explicit "off" is remembered: everyone else gets the music.
const STORAGE_KEY = 'preikh-music';
// Events that count as the visitor doing something, after which browsers allow sound.
const GESTURE_EVENTS = ['click', 'touchend', 'keydown'] as const;

function isTurnedOff(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === 'off';
  } catch {
    return false;
  }
}

function saveChoice(choice: 'on' | 'off'): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, choice);
  } catch {
    // Private mode or blocked storage: the choice just isn't remembered.
  }
}

// Music is a nice extra: if the browser's audio fails, the page carries on without it.
function safely(action: () => void): void {
  try {
    action();
  } catch (error) {
    console.warn('Music could not play', error);
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

// The music plays from the moment the site opens. Browsers keep a page silent until the visitor
// clicks, taps or presses a key, so when the first try is blocked the music starts with that
// first gesture, wherever it lands. The corner button turns it off (and that is remembered) or
// back on. It plays across pages and goes quiet while the tab is in the background.
export function MusicToggle() {
  const t = useMessages(MESSAGES);
  const boxRef = useRef<MusicBox | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [wantsMusic, setWantsMusic] = useState(() => MusicBox.isSupported() && !isTurnedOff());
  const [isAudible, setIsAudible] = useState(false);

  const getBox = () => {
    if (!boxRef.current) {
      const box = new MusicBox();
      box.onRunningChange(setIsAudible);
      boxRef.current = box;
    }
    return boxRef.current;
  };

  // The first try, right on opening the site.
  useEffect(() => {
    if (wantsMusic) safely(() => getBox().play());
    // Only on the first render: later changes go through the button.
  }, []);

  // Still silent though the visitor wants music: start it on their first gesture. A press on the
  // music button itself is left to the button.
  useEffect(() => {
    if (!wantsMusic || isAudible) return;
    const startOnGesture = (event: Event) => {
      if (buttonRef.current?.contains(event.target as Node)) return;
      safely(() => getBox().play());
    };
    for (const type of GESTURE_EVENTS) window.addEventListener(type, startOnGesture, true);
    return () => {
      for (const type of GESTURE_EVENTS) window.removeEventListener(type, startOnGesture, true);
    };
  }, [wantsMusic, isAudible]);

  useEffect(() => {
    if (!wantsMusic) return;
    const followTab = () =>
      safely(() => (document.hidden ? boxRef.current?.pause() : boxRef.current?.play()));
    document.addEventListener('visibilitychange', followTab);
    return () => document.removeEventListener('visibilitychange', followTab);
  }, [wantsMusic]);

  useEffect(() => () => boxRef.current?.close(), []);

  if (!MusicBox.isSupported()) return null;

  const isPlaying = wantsMusic && isAudible;

  const handleClick = () => {
    if (isPlaying) {
      safely(() => getBox().pause());
      setWantsMusic(false);
      saveChoice('off');
    } else {
      safely(() => getBox().play());
      setWantsMusic(true);
      saveChoice('on');
    }
  };

  const label = isPlaying ? t.turnOff : t.turnOn;

  return (
    <div className={styles.music}>
      {wantsMusic && !isAudible && (
        <p className={styles.hint} aria-hidden='true'>
          {t.hint}
        </p>
      )}
      <button
        ref={buttonRef}
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

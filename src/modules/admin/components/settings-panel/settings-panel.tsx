import { useAsyncData } from '@/shared/hooks/use-async-data';
import { fetchSettings, updateSettings } from '../../api/admin-api';
import { useAdminAction } from '../../model/use-admin-action';
import type { VotingSettings } from '../../model/types';
import { AdminPanel } from '../admin-panel/admin-panel';
import { SettingSwitch } from '../setting-switch/setting-switch';
import styles from './settings-panel.module.scss';

const PUBLISH_CONFIRMATION =
  'Опубликовать результаты? Все посетители сайта увидят число голосов за каждого номинанта.';

export function SettingsPanel() {
  const { data: settings, error: loadError, reload } = useAsyncData(fetchSettings, []);
  const { run, isRunning, error: saveError } = useAdminAction(reload);

  const handleToggle = (key: keyof VotingSettings) => {
    if (!settings) return;
    const nextValue = !settings[key];
    if (key === 'resultsPublished' && nextValue && !window.confirm(PUBLISH_CONFIRMATION)) return;
    void run(() => updateSettings({ [key]: nextValue }));
  };

  return (
    <AdminPanel title='Голосование' error={loadError ?? saveError}>
      {settings && (
        <div className={styles.switches}>
          <SettingSwitch
            title='Приём голосов'
            description={
              settings.votingOpen ? 'Пользователи могут голосовать' : 'Голосование закрыто'
            }
            isChecked={settings.votingOpen}
            isDisabled={isRunning}
            onToggle={() => handleToggle('votingOpen')}
          />
          <SettingSwitch
            title='Результаты опубликованы'
            description={
              settings.resultsPublished
                ? 'Посетители видят число голосов'
                : 'Число голосов видно только в админке'
            }
            isChecked={settings.resultsPublished}
            isDisabled={isRunning}
            onToggle={() => handleToggle('resultsPublished')}
          />
        </div>
      )}
    </AdminPanel>
  );
}

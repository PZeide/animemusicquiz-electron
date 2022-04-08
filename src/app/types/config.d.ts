type OnConfigChangeCallback<T> = (newValue?: T, oldValue?: T) => void;

interface AppConfig {
  general: {
    analytics: boolean;
    discordIntegration: boolean;
  };

  appearance: {
    backgroundImage: string;
    transparency: boolean;
    darkTheme: boolean;
  };
}

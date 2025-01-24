export interface Settings {
  theme: 'light' | 'dark';
  debug: boolean;
}
export interface Config {
  settings: Settings;
  metadata?: Record<string, unknown>;
}
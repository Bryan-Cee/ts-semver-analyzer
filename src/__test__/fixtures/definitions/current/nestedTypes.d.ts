export interface Settings {
  theme: 'light' | 'dark' | 'system';
  debug: boolean;
  logLevel: 'info' | 'warn' | 'error';
}
export interface Config {
  settings: Settings;
  metadata?: Record<string, unknown>;
}
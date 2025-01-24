import { ChangeReport } from './ChangeReport';

export interface ChangeDetector {
  detectChanges(): Promise<ChangeReport>;
}
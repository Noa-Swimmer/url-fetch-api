export type FetchStatus = 'pending' | 'completed' | 'failed';

export interface FetchItem {
  url: string;
  finalUrl?: string;
  status: FetchStatus;
  httpStatusCode?: number;
  content?: string;
  error?: string;
}

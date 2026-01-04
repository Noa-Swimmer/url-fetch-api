export enum FetchStatus {
    Pending = 'pending',
    Completed = 'completed',
    Failed = 'failed',
}

export interface FetchItem {
  url: string;
  finalUrl?: string;
  status: FetchStatus;
  httpStatusCode?: number;
  content?: string;
  error?: string;
}

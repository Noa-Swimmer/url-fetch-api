import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { FetchItem, FetchStatus } from './types';

@Injectable()
export class FetchService {
    private readonly logger = new Logger(FetchService.name);
    private readonly store: FetchItem[] = [];
    private processing = false;

    enqueue(urls: string[]) {
        const items = urls.map((url) => {
            const item: FetchItem = { url, status: FetchStatus.Pending };
            this.store.push(item);
            return item;
        });

        this.processPending().catch((err) => this.logger.error('Background processing error', err));

        return {
            count: items.length,
            urls: items.map((i) => i.url),
        };
    }

    getAll(): FetchItem[] {
        return this.store.map((i) => ({ ...i }));
    }

    async processPending(concurrency = 5): Promise<void> {
        if (this.processing) return;
        this.processing = true;
        try {
            const pending = this.store.filter((s) => s.status === FetchStatus.Pending);
            if (pending.length === 0) return;

            // chunk pending items to limit concurrency
            const chunks: FetchItem[][] = [];
            for (let i = 0; i < pending.length; i += concurrency) {
                chunks.push(pending.slice(i, i + concurrency));
            }

            for (const chunk of chunks) {
                await Promise.all(
                    chunk.map((item) => this.fetchItem(item).catch((err) => this.logger.debug(err))),
                );
            }
        } finally {
            this.processing = false;
        }
    }

    private async fetchItem(item: FetchItem): Promise<void> {
        try {
            const response = await axios.get(item.url, {
                maxRedirects: 5,
                timeout: 10000,
                responseType: 'text',
                validateStatus: () => true, 
            });


            const finalUrl =
                response.request?.res?.responseUrl ??
                response.config?.url ??
                item.url;

            item.finalUrl = finalUrl;
            item.httpStatusCode = response.status;

            if (response.status >= 200 && response.status < 300) {
       
                const data = response.data;
                item.content = typeof data === 'string' ? this.truncate(data) : this.truncate(JSON.stringify(data));
                item.status = FetchStatus.Completed;
            } else {
                item.status = FetchStatus.Failed;
                item.error = `HTTP ${response.status}`;
            }
        } catch (err: any) {

            item.status = FetchStatus.Failed;
            if (err && err.code === 'ENOTFOUND') {
                item.error = 'DNS lookup failed';
            } else if (err && err.code === 'ETIMEDOUT') {
                item.error = 'Timeout';
            } else if (err && err.message) {
                item.error = err.message;
            } else {
                item.error = 'Unknown error';
            }
            this.logger.debug(`Fetch failed for ${item.url}: ${item.error}`);
        }
    }

    private truncate(s: string, limit = 1024 * 100): string {
        if (!s) return s;
        return s.length > limit ? s.slice(0, limit) + '\n[truncated]' : s;
    }
}

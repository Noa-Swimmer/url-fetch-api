import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

export type FetchStatus = 'pending' | 'completed' | 'failed';

export interface FetchItem {
    url: string;
    finalUrl?: string;
    status: FetchStatus;
    httpStatusCode?: number;
    content?: string;
    error?: string;
}

@Injectable()
export class FetchService {
    private readonly logger = new Logger(FetchService.name);
    private readonly store: FetchItem[] = [];
    private processing = false;

    // Enqueue URLs for later fetching. Stores items in-memory with 'pending' status.
    // Starts background processing (fire-and-forget) that will attempt to fetch pending items.
    enqueue(urls: string[]) {
        const items = urls.map((url) => {
            const item: FetchItem = { url, status: 'pending' };
            this.store.push(item);
            return item;
        });

        // start processing asynchronously; do not await here to keep endpoint responsive
        this.processPending().catch((err) => this.logger.error('Background processing error', err));

        return {
            count: items.length,
            urls: items.map((i) => i.url),
        };
    }

    /**
     * Return a shallow copy of stored fetch items. Caller should not be able to
     * mutate internal storage.
     */
    getAll(): FetchItem[] {
        return this.store.map((i) => ({ ...i }));
    }

    // Process pending items with limited concurrency.
    /**
     * Process pending items with limited concurrency. Uses a processing flag
     * to avoid overlapping runs when called multiple times.
     */
    async processPending(concurrency = 5): Promise<void> {
        if (this.processing) return;
        this.processing = true;
        try {
            const pending = this.store.filter((s) => s.status === 'pending');
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

    // Fetch a single item and update its fields accordingly. Never throws.
    private async fetchItem(item: FetchItem): Promise<void> {
        try {
            const response = await axios.get(item.url, {
                maxRedirects: 5,
                timeout: 10000,
                responseType: 'text',
                validateStatus: () => true, // do not throw for non-2xx; handle below
            });

            // attempt to read final URL from axios internal request info
            // follow-redirects exposes final URL at response.request.res.responseUrl in Node
            const finalUrl =
                response.request?.res?.responseUrl ??
                response.config?.url ??
                item.url;

            item.finalUrl = finalUrl;
            item.httpStatusCode = response.status;

            if (response.status >= 200 && response.status < 300) {
                // success
                const data = response.data;
                item.content = typeof data === 'string' ? this.truncate(data) : this.truncate(JSON.stringify(data));
                item.status = 'completed';
            } else {
                item.status = 'failed';
                item.error = `HTTP ${response.status}`;
            }
        } catch (err: any) {
            // handle network, timeout, invalid URL, etc.
            item.status = 'failed';
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

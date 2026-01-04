import axios from 'axios';
import { FetchService } from './fetch.service';
import { FetchItem } from './types';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('FetchService', () => {
  let service: FetchService;

  beforeEach(() => {
    service = new FetchService();
    jest.resetAllMocks();
  });

  it('enqueue stores items and returns summary (does not run processing when mocked)', async () => {
    const spy = jest.spyOn(service as any, 'processPending').mockResolvedValue(undefined);

    const res = service.enqueue(['https://example.com']);

    expect(res.count).toBe(1);
    expect(res.urls).toEqual(['https://example.com']);
    expect((service as any).store.length).toBe(1);
    expect(spy).toHaveBeenCalled();
  });

  it('processPending marks a successful 2xx response as completed', async () => {
    (service as any).store.push({ url: 'https://example.com', status: 'pending' } as FetchItem);

    const response = {
      status: 200,
      data: '<html>ok</html>',
      request: { res: { responseUrl: 'https://example.com/final' } },
      config: { url: 'https://example.com' },
    } as any;

    mockedAxios.get.mockResolvedValueOnce(response);

    await service.processPending(1);

    const item: FetchItem = (service as any).store[0];
    expect(item.status).toBe('completed');
    expect(item.httpStatusCode).toBe(200);
    expect(item.finalUrl).toBe('https://example.com/final');
    expect(item.content).toContain('ok');
  });

  it('processPending records non-2xx responses as failed', async () => {
    (service as any).store.length = 0;
    (service as any).store.push({ url: 'https://example.com/notfound', status: 'pending' } as FetchItem);

    const response = {
      status: 404,
      data: 'Not found',
      request: { res: { responseUrl: 'https://example.com/notfound' } },
      config: { url: 'https://example.com/notfound' },
    } as any;

    mockedAxios.get.mockResolvedValueOnce(response);

    await service.processPending(1);

    const item: FetchItem = (service as any).store[0];
    expect(item.status).toBe('failed');
    expect(item.error).toBe('HTTP 404');
    expect(item.httpStatusCode).toBe(404);
  });

  it('processPending records network errors as failed with friendly message', async () => {
    (service as any).store.length = 0;
    (service as any).store.push({ url: 'http://no-such-host.example.invalid', status: 'pending' } as FetchItem);

    mockedAxios.get.mockRejectedValueOnce({ code: 'ENOTFOUND', message: 'getaddrinfo ENOTFOUND' });

    await service.processPending(1);

    const item: FetchItem = (service as any).store[0];
    expect(item.status).toBe('failed');
    expect(item.error).toBe('DNS lookup failed');
  });

  it('processPending records timeout errors as failed with friendly message', async () => {
    (service as any).store.length = 0;
    (service as any).store.push({ url: 'http://timeout.example.invalid', status: 'pending' } as FetchItem);

    mockedAxios.get.mockRejectedValueOnce({ code: 'ETIMEDOUT', message: 'timeout' });

    await service.processPending(1);

    const item: FetchItem = (service as any).store[0];
    expect(item.status).toBe('failed');
    expect(item.error).toBe('Timeout');
  });
});

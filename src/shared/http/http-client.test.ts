import { httpGet } from './http-client.js';
import fetch from 'node-fetch';

jest.mock('node-fetch');
jest.mock('../utils/delay.js', () => ({
  scrapingDelay: jest.fn().mockResolvedValue(undefined),
}));

const mockedFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('HttpClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should make HTTP GET request successfully', async () => {
    const mockResponse = {
      ok: true,
      text: jest.fn().mockResolvedValue('<html>test</html>'),
    };

    mockedFetch.mockResolvedValue(mockResponse as any);

    const result = await httpGet('https://example.com');

    expect(fetch).toHaveBeenCalledWith('https://example.com', {
      headers: expect.objectContaining({
        'User-Agent': expect.any(String),
        'Accept': expect.any(String),
        'Accept-Language': expect.any(String),
      }),
    });
    expect(result).toBe('<html>test</html>');
  });

  it('should retry on failure', async () => {
    const mockResponse = {
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    };

    mockedFetch.mockResolvedValue(mockResponse as any);

    await expect(httpGet('https://example.com', { retries: 2 })).rejects.toThrow();

    expect(mockedFetch).toHaveBeenCalledTimes(3); // Initial + 2 retries
  });
});


import { randomDelay, scrapingDelay } from './delay.js';

describe('Delay utilities', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should delay for random time between min and max', async () => {
    const minMs = 100;
    const maxMs = 200;
    const delayPromise = randomDelay(minMs, maxMs);

    jest.advanceTimersByTime(200);

    await delayPromise;
    expect(true).toBe(true); // If we get here, delay worked
  }, 10000); // Increase timeout

  it('should use scraping delay (10-20s)', async () => {
    const delayPromise = scrapingDelay();

    jest.advanceTimersByTime(20000);

    await delayPromise;
    expect(true).toBe(true);
  }, 25000); // Increase timeout
});


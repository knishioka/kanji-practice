import { describe, expect, it, vi } from 'vitest';
import { runAndRecordOnSuccess } from '../practiceHistory';

describe('runAndRecordOnSuccess', () => {
  it('records after a successful output action', async () => {
    const record = vi.fn();

    await runAndRecordOnSuccess(() => Promise.resolve(), record);

    expect(record).toHaveBeenCalledOnce();
  });

  it('does not record when the output action fails', async () => {
    const record = vi.fn();

    await expect(
      runAndRecordOnSuccess(() => Promise.reject(new Error('output failed')), record),
    ).rejects.toThrow('output failed');
    expect(record).not.toHaveBeenCalled();
  });
});

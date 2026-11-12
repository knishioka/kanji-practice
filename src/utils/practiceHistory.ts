export const MAX_PRACTICE_HISTORY = 20;

export async function runAndRecordOnSuccess(
  action: () => Promise<void>,
  record: () => void,
): Promise<void> {
  await action();
  record();
}

export async function runAndRecordOnSuccess(
  action: () => Promise<void>,
  record: () => void,
): Promise<void> {
  await action();
  record();
}

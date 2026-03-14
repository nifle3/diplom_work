export function wrapS3Error<
  Args extends unknown[],
  Return
>(
  fn: (...args: Args) => Promise<Return>
): (...args: Args) => Promise<Return> {
  return async (...args: Args): Promise<Return> => {
    try {
      return await fn(...args);
    } catch (err: unknown) {
      throw err;
    }
  };
}
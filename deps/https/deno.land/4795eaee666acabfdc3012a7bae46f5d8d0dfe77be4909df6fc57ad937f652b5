/**
 * Collects a list of key-value pairs into an object, with the ability to append multiple values for the same key.
 * @template T The type of the values in the key-value pairs.
 * @param entries An array of key-value pairs to collect.
 * @returns An object with keys for each unique key in the input array, and values that are either a single value of type T or an array of values of type T.
 */
export function collectEntries<T>(
  entries: [string, T][]
): Record<string, T | T[]> {
  const object: Record<string, T | T[]> = {};
  entries.forEach(([key, value]) => {
    if (Reflect.has(object, key)) {
      const current = object[key];
      object[key] = Array.isArray(current)
        ? [...current, value]
        : [current, value];
    } else {
      object[key] = value;
    }
  });
  return object;
}

import { collectEntries } from "./collect_entries.ts";
import { parseFormDataCollection } from "./parse_collection.ts";

/**
 * Parses a `FormData` object and returns an object with the same keys, but with the values parsed according to their type.
 * @param formData A `FormData` object containing form data entries.
 * @returns An object with keys for each unique key in the `FormData` object, and values that are either a single `FormDataValue` or an array of `FormDataValue`s.
 * @module
 */

export function parseFormData(formData: FormData) {
  const entries = Array.from(formData.entries());
  const obj = collectEntries(entries);
  return parseFormDataCollection(obj);
}

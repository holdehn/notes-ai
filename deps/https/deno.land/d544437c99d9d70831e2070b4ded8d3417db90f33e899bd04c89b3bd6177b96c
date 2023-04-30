type FormDataValue =
  | string
  | number
  | boolean
  | File
  | Date
  | null
  | FormDataValue[];

/**
 * Parses a collection of form data entries and returns an object with the same keys, but with the values parsed according to their type.
 * @param obj An object with keys representing form data entry names and values that are either a single `FormDataEntryValue` or an array of `FormDataEntryValue`s.
 * @returns An object with keys for each unique key in the input object, and values that are either a single `FormDataValue` or an array of `FormDataValue`s.
 */
export function parseFormDataCollection(
  obj: Record<string, FormDataEntryValue | FormDataEntryValue[]>
) {
  const entries: [string, FormDataValue][] = Object.entries(obj).map(
    ([key, value]) => {
      return Array.isArray(value)
        ? [key, value.map(parseFormDataValue)]
        : [key, parseFormDataValue(value)];
    }
  );
  return Object.fromEntries(entries);
}

function parseFormDataValue(value: FormDataEntryValue) {
  if (isFile(value)) {
    return value;
  } else if (isBoolean(value)) {
    return parseBoolean(value);
  } else if (isInteger(value)) {
    return parseInt(value);
  } else if (isFloat(value)) {
    return parseFloat(value);
  } else if (isDate(value)) {
    return new Date(value);
  } else if (value === "null") {
    return null;
  } else {
    return value;
  }
}

function isFile(value: FormDataEntryValue): value is File {
  return value instanceof File;
}

function isBoolean(value: string): boolean {
  // "on" is the default value for checkbox and radio inputs
  return value === "true" || value === "false" || value === "on";
}

function parseBoolean(value: string) {
  // value is 'true' or 'on'
  return value !== "false";
}

function isInteger(value: string): boolean {
  return /^-?\d+$/.test(value);
}

function isFloat(value: string, decimals: number | null = null): boolean {
  const regex = decimals
    ? new RegExp(`^-?\\d+(\\.\\d{0,${decimals}})?$`)
    : new RegExp("^-?d+(.d+)?$");
  return regex.test(value);
}

function isDate(value: string): boolean {
  // Test the format of the input string
  if (
    !/^\d{4}[\/\-](0?[1-9]|1[012])[\/\-](0?[1-9]|[12][0-9]|3[01])$/.test(value)
  ) {
    return false;
  }

  // Parse the input string into variables
  const year = value.substring(0, 4);
  const month = value.substring(5, 7);
  const day = value.substring(8, 10);

  // Test if the date is a valid date
  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  return (
    date.getFullYear() === parseInt(year) &&
    date.getMonth() + 1 === parseInt(month) &&
    date.getDate() === parseInt(day)
  );
}

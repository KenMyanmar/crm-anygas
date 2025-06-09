
export const parseGoogleSheetsUrl = (url: string): string | null => {
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : null;
};

export const createCsvUrl = (sheetId: string): string => {
  return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
};

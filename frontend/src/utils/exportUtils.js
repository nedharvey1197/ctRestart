export const exportAnalytics = (data, format = 'json') => {
  switch (format) {
    case 'json':
      return exportAsJson(data);
    case 'csv':
      return exportAsCsv(data);
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}; 
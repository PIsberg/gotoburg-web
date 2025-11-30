export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  // Check if valid date
  if (isNaN(date.getTime())) {
    return dateString; // Fallback to original string if not parsable
  }
  return date.toLocaleDateString('sv-SE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};
/**
 * Format a number with Indian numbering system (comma separators)
 * Pattern: X,XX,XX,XXX (lakhs and crores)
 * 
 * Examples:
 * 1000 → 1,000
 * 10000 → 10,000
 * 100000 → 1,00,000
 * 1000000 → 10,00,000
 * 10000000 → 1,00,00,000
 */
export function formatIndianNumber(value: string | number): string {
  // Convert to string and remove any existing commas
  const numStr = String(value).replace(/,/g, '');
  
  // If empty or not a valid number, return as is
  if (!numStr || isNaN(Number(numStr))) {
    return numStr;
  }
  
  // Split into integer and decimal parts
  const parts = numStr.split('.');
  let integerPart = parts[0];
  const decimalPart = parts[1];
  
  // Handle negative numbers
  const isNegative = integerPart.startsWith('-');
  if (isNegative) {
    integerPart = integerPart.substring(1);
  }
  
  // If less than 4 digits, no formatting needed
  if (integerPart.length <= 3) {
    return (isNegative ? '-' : '') + integerPart + (decimalPart ? '.' + decimalPart : '');
  }
  
  // Indian number format: X,XX,XX,XXX
  // Last 3 digits
  let formatted = integerPart.slice(-3);
  let remaining = integerPart.slice(0, -3);
  
  // Add commas every 2 digits for the remaining part
  while (remaining.length > 0) {
    if (remaining.length <= 2) {
      formatted = remaining + ',' + formatted;
      remaining = '';
    } else {
      formatted = remaining.slice(-2) + ',' + formatted;
      remaining = remaining.slice(0, -2);
    }
  }
  
  return (isNegative ? '-' : '') + formatted + (decimalPart ? '.' + decimalPart : '');
}

/**
 * Parse a formatted Indian number string back to a plain number
 * Removes all commas and converts to number
 */
export function parseIndianNumber(value: string): number {
  // Remove all commas
  const cleaned = value.replace(/,/g, '');
  
  // Convert to number
  const num = parseFloat(cleaned);
  
  // Return 0 if not a valid number
  return isNaN(num) ? 0 : num;
}

/**
 * Handle input change for Indian number formatting
 * Use this in onChange handlers for monetary input fields
 */
export function handleIndianNumberInput(value: string): string {
  // Remove all non-numeric characters except decimal point
  const cleaned = value.replace(/[^0-9.]/g, '');
  
  // Format and return
  return formatIndianNumber(cleaned);
}

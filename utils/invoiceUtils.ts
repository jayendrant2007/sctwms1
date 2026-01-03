
import { Invoice } from '../types';

/**
 * Generates the next sequential Invoice ID in the format INV-YYYY-###
 */
export const getNextInvoiceId = (invoices: Invoice[]): string => {
  const year = new Date().getFullYear();
  const prefix = `INV-${year}-`;
  
  // Filter invoices for the current year
  const yearInvoices = invoices.filter(inv => inv.id.startsWith(prefix));
  
  let nextNumber = 1;
  if (yearInvoices.length > 0) {
    const sequences = yearInvoices
      .map(inv => {
        const parts = inv.id.split('-');
        // Extract the numeric part (index 2 in INV-2024-001)
        return parts.length >= 3 ? parseInt(parts[2], 10) : 0;
      })
      .filter(n => !isNaN(n));
      
    nextNumber = Math.max(...sequences, 0) + 1;
  }
  
  return `${prefix}${String(nextNumber).padStart(3, '0')}`;
};

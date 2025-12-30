/**
 * Parse de data no formato brasileiro (DD/MM/YYYY)
 */
export function parseBrazilianDate(dateStr: string): Date {
  const parts = dateStr.split('/');
  if (parts.length !== 3) {
    throw new Error(`Invalid date format: ${dateStr}. Expected DD/MM/YYYY`);
  }

  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // JavaScript months are 0-indexed
  const year = parseInt(parts[2], 10);

  if (isNaN(day) || isNaN(month) || isNaN(year)) {
    throw new Error(`Invalid date values: ${dateStr}`);
  }

  const date = new Date(year, month, day);
  
  if (date.getDate() !== day || date.getMonth() !== month || date.getFullYear() !== year) {
    throw new Error(`Invalid date: ${dateStr}`);
  }

  return date;
}

/**
 * Formata data para string ISO
 */
export function formatDateISO(date: Date): string {
  return date.toISOString();
}

/**
 * Normaliza string de data removendo espaços e caracteres especiais
 */
export function normalizeDateString(dateStr: string): string {
  return dateStr.trim().replace(/\s+/g, ' ');
}



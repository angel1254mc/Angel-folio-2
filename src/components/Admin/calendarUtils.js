export const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const toYYYYMM = (date) =>
   `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

export const toYYYYMMDD = (year, month, day) =>
   `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

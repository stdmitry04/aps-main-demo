export const TIME_SLOTS = [
  '8 AM - 8:30 AM',
  '8:30 AM - 9 AM',
  '9 AM - 9:30 AM',
  '9:30 AM - 10 AM',
  '10 AM - 10:30 AM',
  '10:30 AM - 11 AM',
  '11 AM - 11:30 AM',
  '11:30 AM - 12 PM',
  '12 PM - 12:30 PM',
  '12:30 PM - 1 PM',
  '1 PM - 1:30 PM',
  '1:30 PM - 2 PM',
  '2 PM - 2:30 PM',
  '2:30 PM - 3 PM',
  '3 PM - 3:30 PM',
  '3:30 PM - 4 PM',
  '4 PM - 4:30 PM',
  '4:30 PM - 5 PM',
] as const;

export const WEEK_DAYS = [
  { id: 'monday', display: 'Monday' },
  { id: 'tuesday', display: 'Tuesday' },
  { id: 'wednesday', display: 'Wednesday' },
  { id: 'thursday', display: 'Thursday' },
  { id: 'friday', display: 'Friday' },
  { id: 'saturday', display: 'Saturday' },
  { id: 'sunday', display: 'Sunday' },
] as const;

export type TimeSlot = typeof TIME_SLOTS[number];
export type WeekDay = typeof WEEK_DAYS[number];

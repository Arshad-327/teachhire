// Fallback taxonomy — used only until a GET /api/subjects endpoint exists.
// IDs must line up with rows already seeded in the `subjects` table.
export const FALLBACK_SUBJECTS = [
  { id: 1, name: 'Mathematics' },
  { id: 2, name: 'Science' },
  { id: 3, name: 'English' },
  { id: 4, name: 'Physics' },
  { id: 5, name: 'Chemistry' },
  { id: 6, name: 'Biology' },
  { id: 7, name: 'Computer Science' },
  { id: 8, name: 'History' },
];

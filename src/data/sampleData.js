// Real iftaar submissions — only verified community reports
// Demo mode falls back to this when Firebase is unavailable
const today = new Date().toISOString().split('T')[0];

export const sampleSubmissions = [
  {
    id: 'kitty-real-1',
    masjidId: 'kitty',
    menu: 'Fried Rice and Pot Roast Chicken',
    submittedBy: 'Community Member',
    submittedAt: new Date().toISOString(),
    servings: null,
    notes: '',
    date: today,
    likes: 0,
    attending: 0,
  },
];

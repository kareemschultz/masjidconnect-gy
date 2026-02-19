// Islamic Library — book catalog
// PDFs are served from public/books/
// To add a book: place the PDF in public/books/ and add an entry here

export const books = [
  {
    id: 'aqeedah-tahawiyyah',
    title: 'Aqeedah Tahawiyyah',
    author: 'Imam At-Tahawi',
    category: 'Aqeedah',
    filename: 'Aqeedah-Tahawiyyah.pdf',
    description: 'Classical text on Islamic creed by Imam Abu Ja\'far At-Tahawi.',
  },
  {
    id: 'fiqh-us-seerah',
    title: 'Fiqh-us-Seerah',
    author: 'Muhammad Al-Ghazali',
    category: 'Seerah',
    filename: 'Fiqh-us-Seerah.pdf',
    description: 'Understanding the life of Prophet Muhammad (peace be upon him) and deriving lessons.',
  },
  {
    id: 'seerah',
    title: 'Seerah',
    author: '',
    category: 'Seerah',
    filename: 'Seerah.pdf',
    description: 'The biography of Prophet Muhammad (peace be upon him).',
  },
  {
    id: 'forty-hadith',
    title: 'Forty Hadith',
    author: 'Imam An-Nawawi',
    category: 'Hadith',
    filename: 'Forty-Hadith.pdf',
    description: 'Imam Nawawi\'s collection of 40 fundamental hadith covering the foundations of Islam.',
  },
  {
    id: 'islamic-jurisprudence',
    title: 'Islamic Jurisprudence',
    author: '',
    category: 'Fiqh',
    filename: 'Islamic-Jurisprudence-1.pdf',
    description: 'Introduction to Islamic jurisprudence (Usul al-Fiqh).',
  },
  {
    id: 'muamalaat',
    title: 'Muamalaat',
    author: '',
    category: 'Fiqh',
    filename: 'Muamalaat.pdf',
    description: 'Islamic rulings on transactions, business dealings, and social interactions.',
  },
  {
    id: 'adab',
    title: 'Adab',
    author: '',
    category: 'Character',
    filename: 'Adab.pdf',
    description: 'Islamic manners, etiquette, and character development.',
  },
  {
    id: 'comparative-religion',
    title: 'Comparative Religion',
    author: '',
    category: 'Dawah',
    filename: 'Comparative-Religion.pdf',
    description: 'Study of world religions from an Islamic perspective.',
  },
  {
    id: 'intro-dawah',
    title: 'Introduction to Dawah Methodology',
    author: '',
    category: 'Dawah',
    filename: 'Introduction-to-dawah-methodology.pdf',
    description: 'Principles and methods of inviting people to Islam.',
  },
  {
    id: 'talim-mutaallim',
    title: "Ta'lim al-Muta'allim",
    author: 'Imam Az-Zarnuji',
    category: 'Education',
    filename: 'Ta_lim-al-muta_allim.pdf',
    description: 'Classical guide on the etiquette of seeking knowledge.',
  },
  {
    id: 'practical-essentials',
    title: 'Practical Essentials for Muslim Students',
    author: '',
    category: 'Education',
    filename: 'Practical-Essentials-for-Muslim-Students.pdf',
    description: 'Essential knowledge and guidance for Muslim students.',
  },
];

export const categories = [...new Set(books.map(b => b.category))];

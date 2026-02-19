// Daily Ramadan reminders — hadiths, ayaat, and wisdoms
export const dailyReminders = [
  {
    text: "Whoever fasts Ramadan out of faith and seeking reward, his previous sins will be forgiven.",
    source: "Sahih al-Bukhari",
    type: "hadith",
  },
  {
    text: "O you who believe! Fasting is prescribed for you as it was prescribed for those before you, that you may attain Taqwa.",
    source: "Quran 2:183",
    type: "ayah",
  },
  {
    text: "When Ramadan begins, the gates of Paradise are opened, the gates of Hell are closed, and the devils are chained.",
    source: "Sahih al-Bukhari",
    type: "hadith",
  },
  {
    text: "The month of Ramadan in which the Quran was revealed, a guidance for mankind and clear proofs for guidance and the criterion.",
    source: "Quran 2:185",
    type: "ayah",
  },
  {
    text: "Whoever provides Iftaar for a fasting person earns the same reward without diminishing the faster's reward at all.",
    source: "Tirmidhi",
    type: "hadith",
  },
  {
    text: "And when My servants ask you concerning Me — indeed I am near. I respond to the invocation of the supplicant when he calls upon Me.",
    source: "Quran 2:186",
    type: "ayah",
  },
  {
    text: "Fasting is a shield. When one of you is fasting, he should avoid indecent speech and quarrelling.",
    source: "Sahih al-Bukhari",
    type: "hadith",
  },
  {
    text: "Indeed, the patient will be given their reward without account.",
    source: "Quran 39:10",
    type: "ayah",
  },
  {
    text: "There are three whose supplication is not rejected: the fasting person when he breaks his fast, the just ruler, and the oppressed.",
    source: "Tirmidhi",
    type: "hadith",
  },
  {
    text: "So verily, with hardship, there is ease. Verily, with hardship, there is ease.",
    source: "Quran 94:5-6",
    type: "ayah",
  },
  {
    text: "The best charity is that given in Ramadan.",
    source: "Tirmidhi",
    type: "hadith",
  },
  {
    text: "Allah does not burden a soul beyond that it can bear.",
    source: "Quran 2:286",
    type: "ayah",
  },
  {
    text: "Whoever stands in prayer during the Night of Power out of faith and seeking reward, his previous sins will be forgiven.",
    source: "Sahih al-Bukhari",
    type: "hadith",
  },
  {
    text: "Indeed, We sent the Quran down during the Night of Decree. And what can make you know what is the Night of Decree? The Night of Decree is better than a thousand months.",
    source: "Quran 97:1-3",
    type: "ayah",
  },
  {
    text: "The Prophet ﷺ was the most generous of people, and he was most generous in Ramadan.",
    source: "Sahih al-Bukhari",
    type: "hadith",
  },
  {
    text: "And eat and drink until the white thread of dawn becomes distinct from the black thread of night. Then complete the fast until sunset.",
    source: "Quran 2:187",
    type: "ayah",
  },
  {
    text: "Whoever does not give up false speech and acting upon it, Allah has no need of his giving up food and drink.",
    source: "Sahih al-Bukhari",
    type: "hadith",
  },
  {
    text: "Remember Me, and I will remember you. Be grateful to Me, and do not deny Me.",
    source: "Quran 2:152",
    type: "ayah",
  },
  {
    text: "The Prophet ﷺ used to break his fast with fresh dates before praying. If there were no fresh dates, he would eat dried dates. If there were none, he drank some water.",
    source: "Abu Dawud",
    type: "hadith",
  },
  {
    text: "And whoever is grateful — his gratitude is only for himself. And whoever is ungrateful — then indeed, my Lord is Free of need and Generous.",
    source: "Quran 27:40",
    type: "ayah",
  },
  {
    text: "Every action of the son of Adam is for him except fasting, for that is solely for Me and I give the reward for it.",
    source: "Sahih al-Bukhari",
    type: "hadith",
  },
  {
    text: "Call upon Me; I will respond to you.",
    source: "Quran 40:60",
    type: "ayah",
  },
  {
    text: "Seek Laylat al-Qadr in the odd nights of the last ten days of Ramadan.",
    source: "Sahih al-Bukhari",
    type: "hadith",
  },
  {
    text: "He who is deprived of its good has indeed been deprived of much good.",
    source: "Ahmad (about Ramadan)",
    type: "hadith",
  },
  {
    text: "And We have certainly made the Quran easy for remembrance, so is there any who will remember?",
    source: "Quran 54:17",
    type: "ayah",
  },
  {
    text: "The fasting person has two joys: joy when he breaks his fast, and joy when he meets his Lord.",
    source: "Sahih Muslim",
    type: "hadith",
  },
  {
    text: "Those who spend their wealth in the cause of Allah and do not follow up their gifts with reminders of their generosity or with injury, their reward is with their Lord.",
    source: "Quran 2:262",
    type: "ayah",
  },
  {
    text: "Make use of five before five: your youth before your old age, your health before your sickness, your wealth before your poverty, your free time before your work, and your life before your death.",
    source: "Hakim",
    type: "hadith",
  },
  {
    text: "My mercy encompasses all things.",
    source: "Quran 7:156",
    type: "ayah",
  },
  {
    text: "Ramadan has come to you — a month of blessing. Allah covers you with mercy, forgives your sins, and answers your prayers.",
    source: "Tabarani",
    type: "hadith",
  },
];

export function getTodayReminder() {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000
  );
  return dailyReminders[dayOfYear % dailyReminders.length];
}

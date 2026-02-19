// Daily Ramadan reminders — hadiths, ayaat, and wisdoms
export const dailyReminders = [
  {
    text: "Whoever fasts Ramadan out of faith and seeking reward, his previous sins will be forgiven.",
    source: "Sahih al-Bukhari 38 · Sahih Muslim 760",
    type: "hadith",
  },
  {
    text: "O you who believe! Fasting is prescribed for you as it was prescribed for those before you, that you may attain Taqwa.",
    source: "Qur'an 2:183",
    type: "ayah",
  },
  {
    text: "When Ramadan begins, the gates of Paradise are opened, the gates of Hell are closed, and the devils are chained.",
    source: "Sahih al-Bukhari 1898 · Sahih Muslim 1079",
    type: "hadith",
  },
  {
    text: "The month of Ramadan in which the Quran was revealed, a guidance for mankind and clear proofs for guidance and the criterion.",
    source: "Qur'an 2:185",
    type: "ayah",
  },
  {
    text: "Whoever provides Iftaar for a fasting person earns the same reward without diminishing the faster's reward at all.",
    source: "Jami' at-Tirmidhi 807 · Sahih",
    type: "hadith",
  },
  {
    text: "And when My servants ask you concerning Me — indeed I am near. I respond to the invocation of the supplicant when he calls upon Me.",
    source: "Qur'an 2:186",
    type: "ayah",
  },
  {
    text: "Fasting is a shield. When one of you is fasting, he should avoid indecent speech and quarrelling.",
    source: "Sahih al-Bukhari 1894 · Sahih Muslim 1151",
    type: "hadith",
  },
  {
    text: "Indeed, the patient will be given their reward without account.",
    source: "Qur'an 39:10",
    type: "ayah",
  },
  {
    text: "There are three whose supplication is not rejected: the fasting person when he breaks his fast, the just ruler, and the oppressed.",
    source: "Jami' at-Tirmidhi 3598 · Ibn Majah 1752",
    type: "hadith",
  },
  {
    text: "So verily, with hardship, there is ease. Verily, with hardship, there is ease.",
    source: "Qur'an 94:5-6",
    type: "ayah",
  },
  {
    text: "The best charity is that given in Ramadan.",
    source: "Jami' at-Tirmidhi 663 · Sahih",
    type: "hadith",
  },
  {
    text: "Allah does not burden a soul beyond that it can bear.",
    source: "Qur'an 2:286",
    type: "ayah",
  },
  {
    text: "Whoever stands in prayer during the Night of Power out of faith and seeking reward, his previous sins will be forgiven.",
    source: "Sahih al-Bukhari 1901 · Sahih Muslim 760",
    type: "hadith",
  },
  {
    text: "Indeed, We sent the Quran down during the Night of Decree. And what can make you know what is the Night of Decree? The Night of Decree is better than a thousand months.",
    source: "Qur'an 97:1-3",
    type: "ayah",
  },
  {
    text: "The Prophet ﷺ was the most generous of people, and he was most generous in Ramadan.",
    source: "Sahih al-Bukhari 1902",
    type: "hadith",
  },
  {
    text: "And eat and drink until the white thread of dawn becomes distinct from the black thread of night. Then complete the fast until sunset.",
    source: "Qur'an 2:187",
    type: "ayah",
  },
  {
    text: "Whoever does not give up false speech and acting upon it, Allah has no need of his giving up food and drink.",
    source: "Sahih al-Bukhari 1903",
    type: "hadith",
  },
  {
    text: "Remember Me, and I will remember you. Be grateful to Me, and do not deny Me.",
    source: "Qur'an 2:152",
    type: "ayah",
  },
  {
    text: "The Prophet ﷺ used to break his fast with fresh dates before praying. If there were no fresh dates, he would eat dried dates. If there were none, he drank some water.",
    source: "Sunan Abi Dawud 2356 · Jami' at-Tirmidhi 696 · Hasan",
    type: "hadith",
  },
  {
    text: "And whoever is grateful — his gratitude is only for himself. And whoever is ungrateful — then indeed, my Lord is Free of need and Generous.",
    source: "Qur'an 27:40",
    type: "ayah",
  },
  {
    text: "Every action of the son of Adam is for him except fasting, for that is solely for Me and I give the reward for it.",
    source: "Sahih al-Bukhari 7492 · Sahih Muslim 1151 (Hadith Qudsi)",
    type: "hadith",
  },
  {
    text: "Call upon Me; I will respond to you.",
    source: "Qur'an 40:60",
    type: "ayah",
  },
  {
    text: "Seek Laylat al-Qadr in the odd nights of the last ten days of Ramadan.",
    source: "Sahih al-Bukhari 2017 · Sahih Muslim 1169",
    type: "hadith",
  },
  {
    text: "He who is deprived of its good has indeed been deprived of much good.",
    source: "Sunan Ibn Majah 1644 · Sahih (about Ramadan)",
    type: "hadith",
  },
  {
    text: "And We have certainly made the Quran easy for remembrance, so is there any who will remember?",
    source: "Qur'an 54:17",
    type: "ayah",
  },
  {
    text: "The fasting person has two joys: joy when he breaks his fast, and joy when he meets his Lord.",
    source: "Sahih al-Bukhari 7492 · Sahih Muslim 1151 (Hadith Qudsi)",
    type: "hadith",
  },
  {
    text: "Those who spend their wealth in the cause of Allah and do not follow up their gifts with reminders of their generosity or with injury, their reward is with their Lord.",
    source: "Qur'an 2:262",
    type: "ayah",
  },
  {
    text: "Make use of five before five: your youth before your old age, your health before your sickness, your wealth before your poverty, your free time before your work, and your life before your death.",
    source: "Mustadrak al-Hakim 7846 · Sahih al-Jami' 1088",
    type: "hadith",
  },
  {
    text: "My mercy encompasses all things.",
    source: "Qur'an 7:156",
    type: "ayah",
  },
  {
    text: "Ramadan has come to you — a month of blessing. Allah covers you with mercy, forgives your sins, and answers your prayers.",
    source: "Sunan al-Nasa'i 2106 · Sahih",
    type: "hadith",
  },
];

export function getTodayReminder() {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000
  );
  return dailyReminders[dayOfYear % dailyReminders.length];
}

export function getTodayReminderIndex() {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000
  );
  return dayOfYear % dailyReminders.length;
}

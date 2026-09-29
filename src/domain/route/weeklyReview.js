// HAFTA TEKRARI -- haftanin konularini bir arada tekrar.
//
// Yeni konu haftasi tek tek duraklarla ilerliyor; hafta sonunda ayni
// dersin konularini karisik cozmek (interleaving) hem kaliciligi hem
// "hangi konunun sorusu bu" ayrimini guclendirir. Bir derste haftada en
// az 2 ogrenme duragi varsa o ders icin tek bir hafta tekrari eklenir.
// Kimlik haftanin tarihini tasir: her haftanin tekrari ayri durak.

const MIN_TOPICS = 2;
const PER_TOPIC_QUESTIONS = 4;
const MAX_QUESTIONS = 20;
export const WEEKLY_REVIEW_TOPIC = "Haftalık tekrar";

export function addWeeklyReviews(weeks = [], { minutesPerQuestion = () => 1.6 } = {}) {
  return weeks.map((week) => {
    const bySubject = new Map();
    for (const stop of week.stops || []) {
      if (stop.isReview || !stop.subject) continue;
      const entry = bySubject.get(stop.subject) || { first: stop, topics: [] };
      if (!entry.topics.includes(stop.topic)) entry.topics.push(stop.topic);
      bySubject.set(stop.subject, entry);
    }
    const extra = [];
    for (const [subject, { first, topics }] of bySubject) {
      if (topics.length < MIN_TOPICS) continue;
      const questions = Math.min(MAX_QUESTIONS, topics.length * PER_TOPIC_QUESTIONS);
      extra.push({
        subject,
        subjectLabel: first.subjectLabel,
        color: first.color,
        topic: WEEKLY_REVIEW_TOPIC,
        weeklyTopics: topics,
        isReview: true,
        reviewCycle: `weekly:${week.weekStart || week.weekNo}`,
        cost: {
          questions,
          minutes: Math.round(questions * minutesPerQuestion(subject)),
          mastery: "review",
          difficulty: "orta",
          yield: 0,
          done: false,
        },
        reasonCodes: ["WEEKLY_REVIEW"],
        scoreComponents: { weeklyTopics: topics },
        dataConfidence: "high",
        position: (week.stops || []).length + extra.length,
      });
    }
    return extra.length ? { ...week, stops: [...week.stops, ...extra] } : week;
  });
}

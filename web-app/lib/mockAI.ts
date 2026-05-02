const replies = [
  "It sounds like today carried both weight and warmth. I noticed a sense of searching in your words — that tension between where you are and where you want to be is something many people feel but few acknowledge. What would it look like to give yourself permission to simply be where you are right now?",
  "There's a quiet resilience in what you shared today. Even in moments that felt heavy, you kept moving forward — that's not nothing, that's everything. What's one thing, however small, that felt like yours today?",
  "I'm hearing a mix of clarity and uncertainty in your entry. It seems like part of you already knows what you need — you're just building the courage to trust it. What does that wiser part of you want you to hear right now?",
  "Today's entry has a real honesty to it. You didn't dress anything up, and that kind of raw reflection is where real growth lives. If this version of you could speak to the version of you from a year ago, what would you say?",
  "Something in your words today feels like standing at a crossroads — not lost, just pausing to orient yourself. That's actually a powerful place to be. What direction feels even slightly more like 'you' right now?",
  "I noticed gratitude woven through parts of your entry, even alongside the harder moments. That's a real skill — holding both at once. What are you most grateful for right now, even if it feels small?",
  "Your entry today shows real self-awareness. You're not just experiencing your emotions — you're watching yourself experience them. That observer part of you is your greatest tool. What pattern are you starting to notice about yourself?",
];

export function getMockAIReply(moodScore: number): string {
  if (moodScore <= 3) {
    return "I hear you — today was hard, and that's okay. You don't have to have it all figured out right now. Sometimes the bravest thing is just showing up and writing it down. What's one small thing that might make tomorrow feel even slightly lighter?";
  }
  if (moodScore >= 8) {
    return "There's real energy in your entry today — something is flowing well for you. It's worth pausing to notice what's contributing to that, so you can find your way back to it. What made today feel different from days that feel heavier?";
  }
  return replies[Math.floor(Math.random() * replies.length)];
}

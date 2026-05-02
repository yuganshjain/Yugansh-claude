type PromptSet = {
  low: string[];    // mood 1-4
  mid: string[];    // mood 5-6
  high: string[];   // mood 7-10
  general: string[];
};

const prompts: PromptSet = {
  low: [
    "What is weighing on me most right now, and why?",
    "What do I need but haven't been giving myself lately?",
    "If I could change one thing about today, what would it be?",
    "What would I say to a friend who felt exactly the way I feel right now?",
    "What small act of kindness could I do for myself tonight?",
    "What am I afraid to admit, even to myself?",
    "When did I last feel truly okay? What was different then?",
    "What would 'good enough' look like today, not perfect?",
  ],
  mid: [
    "What surprised me today, big or small?",
    "What's something I did today that I'm quietly proud of?",
    "What's one thing I want to do differently tomorrow?",
    "Who made me feel something today, and what was it?",
    "What's been on my mind that I haven't said out loud?",
    "What would I do today if I wasn't worried about what others think?",
    "What's something that's been true for a while that I keep ignoring?",
    "Describe today in three words. Then explain each one.",
  ],
  high: [
    "What made today feel different from a hard day? What can I learn from that?",
    "What am I most grateful for right now, and why does it matter?",
    "What am I looking forward to and why does it excite me?",
    "Who deserves more appreciation from me right now?",
    "What would I tell my future self about how I'm feeling today?",
    "What's one thing going really well that I haven't celebrated enough?",
    "What does my best self look like right now?",
    "If today had a title, what would it be?",
  ],
  general: [
    "Describe your energy today like a weather forecast.",
    "What's the gap between who I want to be and who I was today?",
    "What's one conversation I need to have but keep avoiding?",
    "If my body could talk right now, what would it say?",
    "What story am I telling myself that might not be true?",
    "What would I do today if I knew it would all work out?",
    "What am I holding onto that I could let go of?",
    "Finish this sentence: 'The thing I keep forgetting is...'",
  ],
};

export function getPrompts(moodScore: number): string[] {
  const all = moodScore <= 4
    ? [...prompts.low, ...prompts.general]
    : moodScore <= 6
    ? [...prompts.mid, ...prompts.general]
    : [...prompts.high, ...prompts.general];

  // Shuffle and return 3
  const shuffled = all.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3);
}

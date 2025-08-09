// Fallback responses when AI service is unavailable
export const fallbackResponses = {
  chat: [
    "Hello! I'm your Linux 95 desktop assistant. How can I help you today?",
    "Welcome to Linux 95! Feel free to explore the applications.",
    "Need help? Try opening the File Manager or Terminal from the Start menu.",
    "This desktop environment brings back the nostalgic feel of 1995 computing!",
    "I'm here to assist you with your Linux 95 experience."
  ],
  
  textAssist: [
    "Your text looks good! Consider checking grammar and clarity.",
    "Try breaking long sentences into shorter ones for better readability.",
    "Consider adding more descriptive words to enhance your writing.",
    "Structure your ideas with clear paragraphs and transitions.",
    "Review for consistency in tone and style throughout."
  ],
  
  minesweeper: [
    "Look for numbers that match the number of adjacent flags!",
    "Start with corners and edges - they have fewer possibilities.",
    "If a number equals its adjacent flags, remaining squares are safe.",
    "Use logic: if all mines around a number are found, other squares are safe.",
    "Look for patterns: 1-2-1 arrangements often reveal mine locations."
  ],
  
  general: [
    "I'm working with limited capabilities right now, but I'm here to help!",
    "While my AI features are offline, I can still assist with basic tasks.",
    "Try exploring the various applications available in Linux 95!",
    "Check out the Terminal for some classic Unix commands.",
    "The File Manager can help you navigate your virtual file system."
  ]
};

export function getFallbackResponse(category: keyof typeof fallbackResponses): string {
  const responses = fallbackResponses[category] || fallbackResponses.general;
  return responses[Math.floor(Math.random() * responses.length)];
} 
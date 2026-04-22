export const BAD_WORDS = [
  'fuck', 'shit', 'bitch', 'asshole', 'cunt', 'dick', 'pussy', 'whore', 
  'slut', 'fag', 'faggot', 'nigger', 'nigga', 'retard', 'bastard', 'motherfucker', 
  'cock', 'tit', 'tits', 'porn', 'sex', 'rape', 'kill yourself', 'kys', 'die'
];

export const checkOffensiveContent = (text: string): boolean => {
  const lowerText = text.toLowerCase();
  for (const word of BAD_WORDS) {
    // Basic word boundary check
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    if (regex.test(lowerText)) {
      return true;
    }
  }
  return false;
};

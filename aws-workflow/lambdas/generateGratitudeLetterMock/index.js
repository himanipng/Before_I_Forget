exports.handler = async (event) => {
  const gratitudeLetter = [
    `Dear ${event.personName},`,
    '',
    `Thank you for the care you showed through simple daily rituals.`,
    `I still remember: "${event.processedStory?.originalText || event.storyText}"`,
    `That memory reminds me how deeply loved I was by my ${event.relationship}.`,
    '',
    'With gratitude,',
    'Before I Forget'
  ].join('\n');

  return {
    ...event,
    gratitudeLetter,
    status: 'GRATITUDE_LETTER_GENERATED'
  };
};

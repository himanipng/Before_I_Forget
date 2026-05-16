exports.handler = async (event) => {
  const transcript = [
    `This is a remembered story about ${event.personName}, my ${event.relationship}.`,
    event.processedStory?.originalText || event.storyText,
    `It is connected to ${event.country} and the feeling of family care.`
  ].join(' ');

  return {
    ...event,
    transcript,
    status: 'TRANSCRIPT_GENERATED'
  };
};

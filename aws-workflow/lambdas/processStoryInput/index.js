exports.handler = async (event) => {
  const storyText = (event.storyText || '').trim();
  const wordCount = storyText ? storyText.split(/\s+/).length : 0;

  return {
    ...event,
    processedStory: {
      originalText: storyText,
      wordCount,
      summary: `${event.personName} shared a ${event.memoryType?.toLowerCase() || 'memory'} about ${storyText}`
    },
    status: 'STORY_PROCESSED'
  };
};

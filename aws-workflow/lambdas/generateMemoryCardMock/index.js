exports.handler = async (event) => {
  const memoryCard = {
    title: `${event.personName}'s ${event.memoryType} Memory`,
    subtitle: `${event.relationship} from ${event.country}`,
    body: event.processedStory?.originalText || event.storyText,
    keepsakeLine: `A small ritual remembered with love: ${event.memoryType}.`
  };

  return {
    ...event,
    memoryCard,
    status: 'MEMORY_CARD_GENERATED'
  };
};

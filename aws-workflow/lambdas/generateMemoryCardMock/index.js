exports.handler = async (event) => {
  const storyText = event.processedStory?.originalText || event.storyText || '';
  const memoryCard = {
    title: event.memoryType?.toLowerCase() === 'recipe' ? 'The Mornings She Made Warm' : `${event.personName}'s Story, Kept Close`,
    summary:
      event.memoryType?.toLowerCase() === 'recipe'
        ? `Every morning, ${event.personName} made chai before school, not just as a drink, but as a quiet way of showing care.`
        : `${event.personName}'s memory holds a small but lasting lesson about care, distance, and family.`,
    quote: storyText.slice(0, 180),
    lesson: 'Care is often shown through small routines.',
    culturalContext:
      event.country?.toLowerCase() === 'india'
        ? 'Chai can represent comfort, routine, and family care in many South Asian households.'
        : `This memory carries the feeling of ${event.country || 'home'} through everyday family rituals.`,
    followUpQuestion: `What is one routine from ${event.personName} that you never want to forget?`
  };

  return {
    ...event,
    memoryCard,
    status: 'MEMORY_CARD_GENERATED'
  };
};

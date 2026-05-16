exports.handler = async (event) => {
  const translatedText = `[Mock ${event.language} translation] ${event.transcript}`;

  return {
    ...event,
    translatedText,
    status: 'MEMORY_TRANSLATED'
  };
};

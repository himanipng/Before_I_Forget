exports.handler = async (event) => {
  return {
    sessionId: event.sessionId,
    transcript: event.transcript,
    translatedText: event.translatedText,
    memoryCard: event.memoryCard,
    gratitudeLetter: event.gratitudeLetter,
    status: 'COMPLETED'
  };
};

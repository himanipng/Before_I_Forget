exports.handler = async (event) => {
  return {
    memoryId: event.sessionId,
    sessionId: event.sessionId,
    transcript: event.transcript,
    translatedText: event.translatedText,
    memoryCard: event.memoryCard,
    gratitudeLetter: event.gratitudeLetter,
    status: 'COMPLETED'
  };
};

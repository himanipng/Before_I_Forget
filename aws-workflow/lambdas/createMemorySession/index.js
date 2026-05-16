exports.handler = async (event) => {
  const timestamp = new Date().toISOString();
  const personSlug = (event.personName || 'memory').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const sessionId = `${personSlug}-${Date.now()}`;

  return {
    ...event,
    sessionId,
    createdAt: timestamp,
    status: 'SESSION_CREATED'
  };
};

let dynamoClient;
let PutItemCommand;

async function getDynamo() {
  if (!dynamoClient || !PutItemCommand) {
    const sdk = await import('@aws-sdk/client-dynamodb');
    dynamoClient = new sdk.DynamoDBClient({});
    PutItemCommand = sdk.PutItemCommand;
  }

  return { dynamoClient, PutItemCommand };
}

function attr(value) {
  if (value === undefined || value === null) {
    return { NULL: true };
  }

  if (typeof value === 'object') {
    return { S: JSON.stringify(value) };
  }

  return { S: String(value) };
}

exports.handler = async (event) => {
  const createdAt = event.createdAt || new Date().toISOString();
  const memoryId = event.sessionId || `memory-${Date.now()}`;
  const card = event.memoryCard || {};
  const result = {
    memoryId,
    personName: event.personName,
    relationship: event.relationship,
    country: event.country,
    language: event.language,
    memoryType: event.memoryType,
    title: card.title || `${event.personName}'s Memory`,
    summary: card.summary || event.processedStory?.summary || event.storyText,
    quote: card.quote || event.storyText,
    lesson: card.lesson || 'Care is often shown through small routines.',
    culturalContext: card.culturalContext || `This memory is connected to ${event.country || 'home'}.`,
    followUpQuestion: card.followUpQuestion || `What should we ask ${event.personName} next?`,
    gratitudeLetter: event.gratitudeLetter,
    createdAt,
    status: 'SUCCEEDED',
    sessionId: event.sessionId,
    transcript: event.transcript,
    translatedText: event.translatedText,
    memoryCard: event.memoryCard
  };

  const tableName = process.env.MEMORY_TABLE_NAME;

  if (tableName) {
    const dynamo = await getDynamo();
    await dynamo.dynamoClient.send(
      new dynamo.PutItemCommand({
        TableName: tableName,
        Item: Object.fromEntries(Object.entries(result).map(([key, value]) => [key, attr(value)]))
      })
    );
  }

  return result;
};

// The Agent ID must be provided via environment variables in the format:
// projects/{project_id}/locations/{location_id}/reasoningEngines/{agent_id}
const AGENT_ID = process.env.AGENT_ID || '';

let currentSessionId: string | null = null;
// Generate a unique user ID for this browser session
const userId = "user-" + Math.random().toString(36).substring(7);

const getBaseUrl = () => {
  if (!AGENT_ID) {
    throw new Error("AGENT_ID environment variable is missing. Please set it to your deployed Agent ID (projects/.../locations/.../reasoningEngines/...).");
  }
  const parts = AGENT_ID.split('/');
  if (parts.length < 6) {
     throw new Error("Invalid AGENT_ID format. Expected: projects/{project_id}/locations/{location_id}/reasoningEngines/{agent_id}");
  }
  const locationId = parts[3];
  return `https://${locationId}-aiplatform.googleapis.com/v1/${AGENT_ID}`;
};

export const initChat = async () => {
  const baseUrl = getBaseUrl();
  
  // Step 1: Create a Session
  const response = await fetch(`${baseUrl}:query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      classMethod: 'async_create_session',
      input: { user_id: userId }
    })
  });

  if (!response.ok) {
    throw new Error(`Failed to create ADK session: ${response.statusText}`);
  }

  const data = await response.json();
  currentSessionId = data.output.id;
};

export const sendMessageStream = async function* (message: string) {
  if (!currentSessionId) {
    await initChat();
  }

  const baseUrl = getBaseUrl();
  
  // Step 2: Stream Query using the session ID
  const response = await fetch(`${baseUrl}:streamQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      classMethod: 'async_stream_query',
      input: {
        user_id: userId,
        session_id: currentSessionId,
        message: message
      }
    })
  });

  if (!response.ok) {
    throw new Error(`Failed to stream query from ADK: ${response.statusText}`);
  }

  if (!response.body) {
    throw new Error("Response body is null");
  }

  const decoder = new TextDecoder();
  
  // @ts-ignore - async iteration over ReadableStream is supported in modern browsers
  for await (const chunk of response.body) {
    const chunkText = decoder.decode(chunk, { stream: true });
    
    try {
      // Handle potential multiple JSON objects separated by newlines (NDJSON format)
      const lines = chunkText.split('\n').filter(line => line.trim() !== '');
      
      for (const line of lines) {
        const data = JSON.parse(line);
        
        // Extract the text part from the ADK response structure
        if (data.content && data.content.parts && data.content.parts.length > 0) {
          const text = data.content.parts[0].text;
          if (text) {
            yield text;
          }
        }
      }
    } catch (e) {
      console.warn("Failed to parse ADK chunk:", chunkText);
    }
  }
};

export const resetChat = () => {
  currentSessionId = null;
};

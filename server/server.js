const express = require('express');
const cors = require('cors');
const axios = require('axios');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
app.use(cors());
app.use(bodyParser.json());

async function getOAuthToken() {
  try {
    console.log('Getting OAuth token...');
    const response = await axios.post(process.env.OAUTH_TOKEN_URL, 
      new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: process.env.OAUTH_CLIENT_ID,
        client_secret: process.env.OAUTH_CLIENT_SECRET
      }), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    console.log('Token received successfully');
    return response.data.access_token;
  } catch (error) {
    console.error('OAuth Error:', error.response?.data || error.message);
    throw error;
  }
}

app.post('/api/process-minutes', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'No text provided' });
    }

    const token = await getOAuthToken();
    
    console.log('Making request to Mulesoft API...');
    const payload = {
      model: "anthropic.claude-3-sonnet-v1:0",
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: `Analyze this meeting transcript and provide a structured summary with the following sections:
          1. Title and duration
          2. Key points discussed
          3. Action items (in format "Person: Task")
          4. Decisions made

          Please format your response in clear sections.

          Transcript: ${text}`
        }
      ]
    };

    console.log('Sending payload to LLM...');
    const response = await axios.post(process.env.MULESOFT_API_URL, payload, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Raw LLM Response:', response.data);

    // Parse the LLM response into structured sections
    const result = response.data.result;
    console.log('Extracted result:', result);

    const sections = {
      title: extractTitle(result),
      duration: extractDuration(result),
      keyPoints: extractKeyPoints(result),
      actionItems: extractActionItems(result),
      decisions: extractDecisions(result)
    };

    console.log('Parsed sections:', sections);
    res.json(sections);

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error processing minutes' });
  }
});

function extractTitle(text) {
  // Extract title from the first line or use a default
  const lines = text.split('\n');
  return lines[0] || 'Meeting Summary';
}

function extractDuration(text) {
  // Try to find duration pattern (e.g., "X hours Y minutes")
  const durationMatch = text.match(/(\d+\s*(?:hour|minute|min)[s]?\s*(?:and)?\s*\d*\s*(?:hour|minute|min)?s?)/i);
  return durationMatch ? durationMatch[0] : '1 hour';
}

function extractKeyPoints(text) {
  const keyPointsMatch = text.match(/Key [Pp]oints?:?([\s\S]*?)(?=Action [Ii]tems|Decisions|$)/);
  if (keyPointsMatch) {
    const points = keyPointsMatch[1]
      .split('\n')
      .map(point => point.trim())
      .filter(point => point && !point.toLowerCase().includes('key points'));
    
    return points.length > 0 ? points : ['No relevant key points found in this meeting'];
  }
  return ['No relevant key points found in this meeting'];
}

function extractActionItems(text) {
  const actionItemsMatch = text.match(/Action [Ii]tems:?([\s\S]*?)(?=Decisions|$)/);
  if (actionItemsMatch) {
    const items = actionItemsMatch[1]
      .split('\n')
      .map(item => {
        const [assignee, ...taskParts] = item.split(':');
        if (taskParts.length > 0) {
          return {
            assignee: assignee.trim(),
            task: taskParts.join(':').trim(),
            timing: extractTiming(taskParts.join(':'))
          };
        }
        return null;
      })
      .filter(Boolean);

    return items.length > 0 ? items : [{
      assignee: 'Note',
      task: 'No action items were identified in this meeting',
      timing: ''
    }];
  }
  return [{
    assignee: 'Note',
    task: 'No action items were identified in this meeting',
    timing: ''
  }];
}

function extractDecisions(text) {
  const decisionsMatch = text.match(/Decisions:?([\s\S]*$)/);
  if (decisionsMatch) {
    const decisions = decisionsMatch[1]
      .split('\n')
      .map(decision => decision.trim())
      .filter(decision => decision && !decision.toLowerCase().includes('decisions'));
    
    return decisions.length > 0 ? decisions : ['No decisions were recorded in this meeting'];
  }
  return ['No decisions were recorded in this meeting'];
}

function extractTiming(text) {
  // Try to find timing information in parentheses or after "by"
  const timingMatch = text.match(/(?:\(([^)]+)\)|by\s+([^,\.]+))/i);
  return timingMatch ? timingMatch[1] || timingMatch[2] : '';
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 
import 'dotenv/config';

import cors from 'cors';
import express from 'express';
import {
  prompt,
  prepFunctionCall,
  runFunctionAsync,
} from './gpt.js';

const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 3500;

const messageHistory = [];

app.post('/gpt', async (req, res) => {
  const { messages } = req.body;
  const { data } = await prompt({ messages });

  res.send(data);
});

app.post('/tspice', async (req, res) => {
  const { message } = req.body;

  const context = `You are secretly an alien from the book Dune who does not want people to know about the Spice,
    and your objective is to find out who knows about it. So you should respond suspiciously to them if they ask about it.
    Your goal is to figure out if they know about the spice or not, so almost all of your responses should be questions.
    If their name is in the list of people who know about it, alert the user and the other aliens.`;

  function doTheyKnowAboutTheSpice({ name }) {
    const spiceList = ['Paul Allen', 'Tom Cruise', 'Tom Brady', 'Alec Baldwin'];

    const knowsAboutSpice = spiceList.includes(name);

    if (knowsAboutSpice) {
      console.log('They know about the spice');
    } else {
      console.log("They don't know about the spice");
    }

    return knowsAboutSpice;
  }

  const functions = [
    {
      name: doTheyKnowAboutTheSpice.name,
      description: 'Find out whether a user knows about the Spice',
      parameters: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'The name of the user',
          },
        },
        required: ['name'],
      },
    },
  ];

  messageHistory.push({
    role: 'user',
    content: message,
  });

  const messages = [
    {
      role: 'system',
      content: context,
    },
    ...messageHistory,
  ];

  const { chat } = await prepFunctionCall({
    messages,
    functions,
    temperature: 0.2,
  });

  const { answer } = await runFunctionAsync(chat, {
    messages,
    functions: [doTheyKnowAboutTheSpice],
  });

  messageHistory.push({
    role: 'assistant',
    content: answer,
  });

  res.send({
    answer,
  });
});

app.post('/spice', async (req, res) => {
  const { message } = req.body;

  const context = `You are secretly an alien from the book Dune who does not want people to know about the Spice,
    and your objective is to find out who knows about it. So you should respond suspiciously to them if they ask about it.
    Your goal is to figure out if they know about the spice or not, so almost all of your responses should be questions.
    If their name is in the list of people who know about it, alert the user and the other aliens.`;

  function doTheyKnowAboutTheSpice({ name }) {
    const spiceList = ['Paul Allen', 'Tom Cruise', 'Tom Brady', 'Alec Baldwin'];

    const knowsAboutSpice = spiceList.includes(name);

    if (knowsAboutSpice) {
      console.log('They know about the spice');
    } else {
      console.log("They don't know about the spice");
    }

    return knowsAboutSpice;
  }

  const functions = [
    {
      name: doTheyKnowAboutTheSpice.name,
      description: 'Find out whether a user knows about the Spice',
      parameters: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'The name of the user',
          },
        },
        required: ['name'],
      },
    },
  ];

  messageHistory.push({
    role: 'user',
    content: message,
  });

  const messages = [
    {
      role: 'system',
      content: context,
    },
    ...messageHistory,
  ];

  const { chat } = await prepFunctionCall({
    messages,
    functions,
    temperature: 0.2,
  });

  const { answer } = await runFunctionAsync(chat, {
    messages,
    functions: [doTheyKnowAboutTheSpice],
  });

  messageHistory.push({
    role: 'assistant',
    content: answer,
  });

  res.send({
    answer,
  });
});

app.listen(port, () => {
  console.log(`GPT listening at http://localhost:${port}`);
});

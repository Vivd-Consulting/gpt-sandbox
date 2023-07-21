import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const model = process.env.GPT_MODEL || 'gpt-4-0613';

export async function chat({ messages }) {
  return openai.createChatCompletion({
    model,
    messages,
  });
}

export async function prompt({ messages }) {
  const chat = await openai.createChatCompletion({
    model,
    messages,
  });

  const content = chat.data.choices[0].message?.content;

  return {
    chat,
    response: {
      role: 'assistant',
      content,
    },
    answer: content,
  };
}

export async function prepFunctionCall({ messages, functions, temperature }) {
  const chat = await openai.createChatCompletion({
    model,
    temperature,
    messages,
    functions,
    function_call: 'auto',
  });

  return {
    chat,
    messages,
  };
}

export async function runFunctionAsync(chat, { messages, functions }) {
  const fnMaps = {};
  functions.forEach((fn) => {
    fnMaps[fn.name] = fn;
  });

  const chatData = chat.data;
  const wantsToUseFunction =
    chatData.choices[0].finish_reason === 'function_call';

  if (wantsToUseFunction) {
    const { name, arguments: _arguments } =
      chatData.choices[0].message?.function_call;

    const fn = fnMaps[name];
    const args = JSON.parse(_arguments);

    const returnData =
      fn.constructor.name === 'AsyncFunction' ? await fn(args) : fn(args);

    const chatWithFunction = await openai.createChatCompletion({
      model,
      messages: [
        ...messages,
        {
          role: 'function',
          name,
          content: JSON.stringify(returnData),
        },
      ],
    });

    const answer = chatWithFunction.data.choices[0].message?.content;

    return {
      answer,
      data: chatWithFunction.data,
    };
  }

  return {
    answer: chatData.choices[0].message?.content,
    data: chatData,
  };
}

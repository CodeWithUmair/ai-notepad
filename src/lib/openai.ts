import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY;

if(!apiKey) {
  throw Error('OPENAI_API_KEY is not set');
}

const openAI = new OpenAI({});

export default openAI;
import {Pinecone} from "@pinecone-database/pinecone";

const apiKey = process.env.PINECONE_API_KEY;

if(!apiKey) {
  throw Error('PINECONE_API_KEY is not set');
}

const pinecone = new Pinecone({
  environment: "gcp-stater",
  apiKey
});

console.log("Pinecone: 👉 ", pinecone)
console.log("Pinecone.Index('ai-botepad '): 👉👉 ", pinecone.Index("ai-notepad"))

export const notesIndex = pinecone.Index("ai-notepad")
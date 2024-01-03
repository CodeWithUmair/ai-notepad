import { notesIndex } from "@/lib/db/pinecone";
import prisma from "@/lib/db/prisma";
import { getEmbedding } from "@/lib/openai";
import { auth } from "@clerk/nextjs";
import { ChatCompletionMessage } from "openai/resources/index.mjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages: ChatCompletionMessage[] = body.messages;

    const messagesTruncated = messages.slice(-6);
    
    const embedding = await getEmbedding(
      messagesTruncated.map(msg => msg.content).join('\n')
    )

    const {userId} = auth();

    const vectorQueryResponse = await notesIndex.query({
      vector: embedding,
      topK: 4,
      filter: {userId}
    })

    const relevantNotes = await prisma.note.findMany({
      where: {
        id: {
          in: vectorQueryResponse.matches.map((match) => match.id)
        }
      }
    })
    
    console.log("Relevant notes found: ", relevantNotes)

    const systemMessage: ChatCompletionMessage = {
      role: "system",
      content:
        "You are an intelligent note-taking app. You answer's question based on their existing notes. " + 
        "The relevant notes for this query are:\n" + 
        relevantNotes.map((note) => `Title: ${note.title}\n\nContent:\n${note.content}`).join("\n\n")

      }

  } catch (error) {
    console.log(error);
    return Response.json(
      { error: "Internal server error [POST]" },
      { status: 500 },
    );
  }
}
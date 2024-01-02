import { notesIndex } from "@/lib/db/pinecone";
import prisma from "@/lib/db/prisma";
import { getEmbedding } from "@/lib/openai";
import {
  createNoteSchema,
  deleteNoteSchema,
  updateNoteSchema,
} from "@/lib/validation/note";
import { auth } from "@clerk/nextjs";

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    const body = await req.json();

    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const parseResult = createNoteSchema.safeParse(body);

    if (!parseResult.success) {
      console.log(parseResult.error);
      return Response.json({ error: "Invalid error " }, { status: 400 });
    }

    const { title, content } = parseResult.data;


    const embedding = await getEmbeddingForNote(title, content);
    console.log("Embedding is done here: ")
    const note = await prisma.$transaction(async (tx) => {
  console.log("I'm in the $transaction prisma 😎")

      const note = await tx.note.create({
        data: {
          title,
          content,
          userId,
        }
      })

  console.log("Now I'm waiting for Pinecone error 🙄🙄🙄")
  console.log("note: 👉👉👉", note)


      await notesIndex.upsert([
        {
          id: note.id,
          values: embedding,
          metadata: {userId}
        }
      ])

  console.log("I definately say that 'note' is a falsy value 😴")

      return note;
    });

    return Response.json({ note }, { status: 201 });
  } catch (error) {
    console.log(error);
    return Response.json(
      { error: "Internal server error [POST]" },
      { status: 500 },
    );
  }
}

export async function PUT(req: Request) {
  try {
    const { userId } = auth();
    const body = await req.json();

    const parseResult = updateNoteSchema.safeParse(body);

    if (!parseResult.success) {
      console.log(parseResult.error);
      return Response.json({ error: "Invalid error " }, { status: 400 });
    }

    const { id, title, content } = parseResult.data;

    const note = await prisma.note.findUnique({
      where: { id },
    });

    if (!note) {
      return Response.json({ error: "Your Note note found" }, { status: 404 });
    }

    if (!userId || userId !== note.userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const updatedNote = await prisma.note.update({
      where: { id },
      data: {
        title,
        content,
      },
    });

    return Response.json({ updatedNote }, { status: 200 });
  } catch (error) {
    console.log(error);
    return Response.json(
      { error: "Internal server error [PUT]" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { userId } = auth();
    const body = await req.json();

    const parseResult = deleteNoteSchema.safeParse(body);

    if (!parseResult.success) {
      console.log(parseResult.error);
      return Response.json({ error: "Invalid error " }, { status: 400 });
    }

    const { id } = parseResult.data;

    const note = await prisma.note.findUnique({
      where: { id },
    });

    if (!note) {
      return Response.json({ error: "Your Note note found" }, { status: 404 });
    }

    if (!userId || userId !== note.userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.note.delete({ where: { id } });

    return Response.json({ message: "Note deleted" }, { status: 200 });
  } catch (error) {
    console.log(error);
    return Response.json(
      { error: "Internal server error [PUT]" },
      { status: 500 },
    );
  }
}

async function getEmbeddingForNote(title: string, content: string|undefined) {
  return getEmbedding(title + "\n\n" + content ?? "")
}
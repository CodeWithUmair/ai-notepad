import { auth } from "@clerk/nextjs";

import prisma from "@/lib/db/prisma";
import { notesIndex } from "@/lib/db/pinecone";
import { getEmbedding } from "@/lib/openai";
import {
  createNoteSchema,
  deleteNoteSchema,
  updateNoteSchema,
} from "@/lib/validation/note";

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

    const note = await prisma.$transaction(async (tx) => {
      // 1. Creating data in MongoDB
      const note = await tx.note.create({
        data: {
          title,
          content,
          userId,
        },
      });

      // 2. Creating the data in Pinecone Vector DB
      await notesIndex.upsert([
        {
          id: note.id,
          values: embedding,
          metadata: { userId },
        },
      ]);

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

    const embedding = await getEmbeddingForNote(title, content);

    const updatedNote = await prisma.$transaction(async (tx) => {
      // 1. Updating the data in MongoDB
      const updatedNote = await tx.note.update({
        where: { id },
        data: {
          title,
          content,
        },
      });

      // 2. Updating the data in Pinecone Vector DB
      await notesIndex.upsert([
        {
          id,
          values: embedding,
          metadata: { userId },
        },
      ]);

      return updatedNote;
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

    await prisma.$transaction(async (tx) => {
      // 1. Deleting the data from MongoDB
      await tx.note.delete({ where: { id } });

      // 2. Deleting the data from Pinecone Vector DB
      await notesIndex.deleteOne(id);
    });

    return Response.json({ message: "Note deleted" }, { status: 200 });
  } catch (error) {
    console.log(error);
    return Response.json(
      { error: "Internal server error [PUT]" },
      { status: 500 },
    );
  }
}

async function getEmbeddingForNote(title: string, content: string | undefined) {
  return getEmbedding(title + "\n\n" + content ?? "");
}

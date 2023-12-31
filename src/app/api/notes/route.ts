import prisma from "@/lib/db/prisma";
import { createNoteSchema } from "@/lib/validation/note";
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

    const note = await prisma.note.create({
      data: {
        title,
        content,
        userId,
      },
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

    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const parseResult = createNoteSchema.safeParse(body);

    if (!parseResult.success) {
      console.log(parseResult.error);
      return Response.json({ error: "Invalid error " }, { status: 400 });
    }

    const { title, content } = parseResult.data;

    const note = await prisma.note.create({
      data: {
        title,
        content,
        userId,
      },
    });

    return Response.json({ note }, { status: 201 });
  } catch (error) {
    console.log(error);
    return Response.json(
      { error: "Internal server error [PUT]" },
      { status: 500 },
    );
  }
}

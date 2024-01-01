"use client";

import { useState } from "react";
import { Note as NoteModel } from "@prisma/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import AddEditNoteDialog from "./AddEditNoteDialog";

type NoteProps = {
  note: NoteModel;
};

export default function Note({ note }: NoteProps) {
  const [showEditNoteDialog, setShowEditNoteDialog] = useState(false);
  const wasUpdated = note.updatedAt > note.createdAt;

  const createdUpdatedAtTimestamp = (
    wasUpdated ? note.updatedAt : note.createdAt
  ).toDateString();

  return (
    <>
      <Card
        className="cursor-pointer transition-shadow hover:shadow-lg h-[350px]"
        onClick={() => setShowEditNoteDialog(true)}
      >
        <CardHeader>
          <CardTitle>{note.title}</CardTitle>
          <CardDescription>
            {createdUpdatedAtTimestamp}
            {wasUpdated && " (updated)"}
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[230px] overflow-y-scroll break-words xs:min-w-[350px] shadow-inner">
          <p className="whitespace-pre-line pt-2">{note.content}</p>
        </CardContent>
      </Card>
      <AddEditNoteDialog
        open={showEditNoteDialog}
        setOpen={setShowEditNoteDialog}
        noteToEdit={note}
      />
    </>
  );
}

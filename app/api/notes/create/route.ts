import { supabaseServer } from "@/lib/supabase/server";

type CreateNotePayload = {
  student_id: string;
  note_date: string;
  note_type: string;
  author: string;
  raw_content: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<CreateNotePayload>;

    if (
      !body.student_id ||
      !body.note_date ||
      !body.note_type ||
      !body.author ||
      !body.raw_content?.trim()
    ) {
      return Response.json({ success: false, error: "Missing required fields." }, { status: 400 });
    }

    const { error } = await supabaseServer.from("notes").insert({
      student_id: body.student_id,
      note_date: body.note_date,
      note_type: body.note_type,
      author: body.author,
      raw_content: body.raw_content.trim(),
      extraction_status: "Pending",
    });

    if (error) {
      return Response.json({ success: false, error: error.message }, { status: 500 });
    }

    return Response.json({ success: true });
  } catch {
    return Response.json({ success: false, error: "Invalid request body." }, { status: 400 });
  }
}

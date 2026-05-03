import { supabaseServer } from "@/lib/supabase/server";

const ALLOWED_FIELDS = new Set(["ball_owner", "current_status"]);
const ALLOWED_BALL_OWNERS = new Set(["Student", "Chris", "Gav", "Mark", "Laura", "Esther"]);

type UpdateFieldPayload = {
  student_id: string;
  field: "ball_owner" | "current_status";
  value: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<UpdateFieldPayload>;

    if (!body.student_id || !body.field || typeof body.value !== "string") {
      return Response.json({ success: false, error: "Missing required fields." }, { status: 400 });
    }

    if (!ALLOWED_FIELDS.has(body.field)) {
      return Response.json({ success: false, error: "Field is not editable." }, { status: 400 });
    }

    if (body.field === "ball_owner" && !ALLOWED_BALL_OWNERS.has(body.value)) {
      return Response.json({ success: false, error: "Invalid ball owner." }, { status: 400 });
    }

    const updateValue =
      body.field === "current_status" && body.value.trim().length === 0 ? null : body.value.trim();

    const { error } = await supabaseServer
      .from("students")
      .update({ [body.field]: updateValue })
      .eq("id", body.student_id);

    if (error) {
      return Response.json({ success: false, error: error.message }, { status: 500 });
    }

    return Response.json({ success: true });
  } catch {
    return Response.json({ success: false, error: "Invalid request body." }, { status: 400 });
  }
}

import { NextResponse } from "next/server";

const COMBO_SK = process.env.COMBO_SK;

async function safeJson(res: Response): Promise<Record<string, unknown> | null> {
  try { return await res.json(); } catch { return null; }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!COMBO_SK || COMBO_SK === "your_combo_secret_key_here") {
    return NextResponse.json(
      { message: "COMBO_SK is not configured." },
      { status: 500 }
    );
  }

  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ message: "id parameter is required" }, { status: 400 });
    }

    const response = await fetch(
      `https://api.designcombo.dev/v1/projects/render/${id}/status`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${COMBO_SK}`,
        },
        cache: "no-store",
      }
    );

    const data = await safeJson(response);

    if (!response.ok) {
      const msg = (data?.message as string) || `Status check failed (${response.status})`;
      console.error("[render GET] status check failed:", response.status, data);
      return NextResponse.json({ message: msg }, { status: response.status });
    }

    return NextResponse.json(data, { status: 200 });

  } catch (error) {
    console.error("[render GET] unexpected error:", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unexpected server error" },
      { status: 500 }
    );
  }
}

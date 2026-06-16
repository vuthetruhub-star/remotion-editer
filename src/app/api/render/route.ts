import { NextResponse } from "next/server";

const COMBO_SK = process.env.COMBO_SK;

function missingKey() {
  return NextResponse.json(
    { message: "COMBO_SK is not configured. Add your DesignCombo secret key to .env.local." },
    { status: 500 }
  );
}

/** Safely parse JSON from a Response; returns null if the body is not JSON. */
async function safeJson(res: Response): Promise<Record<string, unknown> | null> {
  try { return await res.json(); } catch { return null; }
}

export async function POST(request: Request) {
  if (!COMBO_SK || COMBO_SK === "your_combo_secret_key_here") return missingKey();

  try {
    const body = await request.json();

    // Step 1: Create project
    const projectResponse = await fetch("https://api.designcombo.dev/v1/projects", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${COMBO_SK}`,
      },
      body: JSON.stringify(body),
    });

    if (!projectResponse.ok) {
      const err = await safeJson(projectResponse);
      const msg = (err?.message as string) || `DesignCombo error (${projectResponse.status})`;
      console.error("[render POST] project creation failed:", projectResponse.status, err);
      return NextResponse.json({ message: msg }, { status: projectResponse.status });
    }

    const projectData = await safeJson(projectResponse);
    const projectId = (projectData as any)?.project?.id;
    if (!projectId) {
      console.error("[render POST] no projectId in response:", projectData);
      return NextResponse.json({ message: "No project ID returned from DesignCombo." }, { status: 502 });
    }

    // Step 2: Start export
    const exportResponse = await fetch(
      `https://api.designcombo.dev/v1/projects/${projectId}/export`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${COMBO_SK}`,
        },
      }
    );

    if (!exportResponse.ok) {
      const err = await safeJson(exportResponse);
      const msg = (err?.message as string) || `Export init failed (${exportResponse.status})`;
      console.error("[render POST] export init failed:", exportResponse.status, err);
      return NextResponse.json({ message: msg }, { status: exportResponse.status });
    }

    const exportData = await safeJson(exportResponse);
    console.log("[render POST] export started:", exportData);
    return NextResponse.json(exportData, { status: 200 });

  } catch (error) {
    console.error("[render POST] unexpected error:", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unexpected server error" },
      { status: 500 }
    );
  }
}

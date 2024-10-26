import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "PDF endpoint is working" });
}

export async function POST(request: NextRequest) {
  console.log("Starting PDF processing...");

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    console.log("Received file:", file.name, file.type, file.size);

    return NextResponse.json({
      success: true,
      message: "File received successfully",
      file: {
        name: file.name,
        type: file.type,
        size: file.size,
      },
    });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}

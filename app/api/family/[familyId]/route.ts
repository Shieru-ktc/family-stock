import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ familyId: string }> }
): Promise<NextResponse> {
  const { familyId } = await params;
  const session = await auth();
}

import { NextResponse } from "next/server";
import { FailureResponse } from "./types";

export class CustomResponse extends NextResponse {
  constructor() {
    super();
  }

  static unauthorized(
    message: string = "Unauthorized"
  ): NextResponse<FailureResponse> {
    return this.json({ error: message, success: false }, { status: 401 });
  }

  static noPermission(
    message: string = "No Permission"
  ): NextResponse<FailureResponse> {
    return this.json({ error: message, success: false }, { status: 403 });
  }
}

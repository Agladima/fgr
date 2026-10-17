import { NextResponse } from "next/server";

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export function successResponse<T>(
  data: T,
  message?: string,
  status = 200,
  headers?: Record<string, string>
) {
  const body: ApiResponse<T> = {
    success: true,
    ...(message ? { message } : {}),
    data,
  };
  return NextResponse.json(body, { status, headers });
}

export function errorResponse(
  message: string,
  status = 400,
  code = "BAD_REQUEST",
  details?: unknown,
  headers?: Record<string, string>
) {
  const body: ApiResponse = {
    success: false,
    error: {
      code,
      message,
      ...(details !== undefined ? { details } : {}),
    },
  };
  return NextResponse.json(body, { status, headers });
}

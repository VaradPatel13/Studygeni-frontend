import { NextResponse } from 'next/server';

export type ApiResponse<T = any> = {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any;
  code?: string;
};

export function sendSuccess<T>(message: string, data?: T, status = 200) {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
    },
    { status }
  );
}

export function sendError(
  message: string,
  code = 'INTERNAL_ERROR',
  status = 500,
  errors?: any
) {
  return NextResponse.json(
    {
      success: false,
      message,
      code,
      errors,
    },
    { status }
  );
}

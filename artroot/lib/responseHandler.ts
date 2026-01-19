import { NextResponse } from 'next/server';

interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
  timestamp: string;
}

/**
 * Sends a success response with consistent envelope
 * @param data - The data to return
 * @param message - Optional success message
 * @param status - HTTP status code (default: 200)
 */
export function sendSuccess(
  data?: any,
  message: string = 'Success',
  status: number = 200
): NextResponse<ApiResponse> {
  const response: ApiResponse = {
    success: true,
    message,
    timestamp: new Date().toISOString(),
  };

  if (data !== undefined) {
    response.data = data;
  }

  return NextResponse.json(response, { status });
}

/**
 * Sends an error response with consistent envelope
 * @param message - Error message
 * @param errorCode - Optional error code reference
 * @param status - HTTP status code (default: 500)
 */
export function sendError(
  message: string = 'An error occurred',
  errorCode?: string,
  status: number = 500
): NextResponse<ApiResponse> {
  const response: ApiResponse = {
    success: false,
    message,
    timestamp: new Date().toISOString(),
  };

  if (errorCode) {
    response.error = errorCode;
  }

  return NextResponse.json(response, { status });
}

/**
 * Standard success response
 */
export function successResponse(res: any, data: any, statusCode: number = 200) {
  return res.status(statusCode).json({
    success: true,
    data,
  });
}

/**
 * Standard error response
 */
export function errorResponse(res: any, message: string, statusCode: number = 500, code?: string) {
  return res.status(statusCode).json({
    success: false,
    error: message,
    ...(code && { code }),
  });
}

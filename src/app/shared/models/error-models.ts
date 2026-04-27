export interface AppError {
  statusCode: number;
  errorCode: string;
  message: string;
  fieldErrors?: Record<string, string[]>;
}

/**
 * Error with an explicit HTTP status code.
 *
 * Routes should only expose messages from this type; other errors are logged
 * and returned as 500 so internal details are not leaked.
 */
export class HttpError extends Error {
  constructor(
    readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

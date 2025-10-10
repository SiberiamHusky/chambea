/**
 * A custom exception that represents a NotFound error.
 */

// Import required modules
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { HttpException, HttpStatus } from '@nestjs/common';

// Import internal modules
import { ExceptionConstants } from './exceptions.constants';
import { IException, IHttpNotFoundExceptionResponse } from './exceptions.interface';

export class NotFoundException extends HttpException {
  @ApiProperty({
    enum: ExceptionConstants.NotFoundCodes,
    description: 'A unique code identifying the error.',
    example: ExceptionConstants.NotFoundCodes.RESOURCE_NOT_FOUND,
  })
  code: number; // Internal status code

  @ApiProperty({
    description: 'A human-readable description of the error.',
    example: 'The requested resource could not be found.',
  })
  description: string; // Human-readable description

  @ApiProperty({
    description: 'A timestamp indicating when the error occurred.',
    example: '2023-01-01T00:00:00.000Z',
  })
  timestamp: string; // Timestamp

  @ApiProperty({
    description: 'A unique identifier for tracing the error.',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  traceId: string; // Trace ID

  @ApiHideProperty()
  cause: Error | undefined; // Cause of the error

  /**
   * Creates a new instance of NotFoundException.
   *
   * @param exception - The exception details.
   */
  constructor(exception: IException) {
    // Call the parent constructor with options object
    super(exception.message, HttpStatus.NOT_FOUND, exception.cause ? { cause: exception.cause } : undefined);

    // Set the properties
    this.code = exception.code || ExceptionConstants.NotFoundCodes.RESOURCE_NOT_FOUND;
    this.description = exception.description || exception.message;
    this.timestamp = new Date().toISOString();
    this.traceId = this.generateTraceId();
    this.cause = exception.cause;
  }

  /**
   * Generates a unique trace ID.
   *
   * @returns A unique trace ID.
   */
  private generateTraceId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.floor(Math.random() * 16);
      const v = c === 'x' ? r : (r % 4) + 8; // evita bitwise y mantiene patrón UUID v4
      return v.toString(16);
    });
  }

  /**
   * Returns the response object for the exception.
   *
   * @returns The response object.
   */
  getResponse(): IHttpNotFoundExceptionResponse {
    return {
      code: this.code,
      message: this.message,
      description: this.description,
      timestamp: this.timestamp,
      traceId: this.traceId,
    };
  }
}

// https://docs.nestjs.com/exception-filters#catch-everything
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, LoggerService, Logger } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';


@Catch()
export class CatchEverythingFilter implements ExceptionFilter {
  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    private readonly logger: LoggerService,
  ) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    // In certain situations `httpAdapter` might not be available in the
    // constructor method, thus we should resolve it here.
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let responseBody = {
      statusCode: httpStatus,
      error: '',
      message: '',
      cause: '',
    };
    
    if (exception instanceof HttpException) {
      responseBody.error = exception.name;
      responseBody.message = exception.message;
      // @ts-expect-error
      responseBody.cause = exception.cause;
    } else if (exception instanceof Error) {
      responseBody['error'] = exception.name;
      responseBody['message'] = exception.message;
      responseBody['cause'] = JSON.stringify(exception.stack);
    } else {
      this.logger.error(exception);
      responseBody['error'] = 'UNKNOWN'
      responseBody['message'] = 'UNKNOWN'
      responseBody['cause'] = 'server currently not handling this'
    }

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}

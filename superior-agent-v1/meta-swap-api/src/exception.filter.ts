// https://docs.nestjs.com/exception-filters#catch-everything
import {
	type ArgumentsHost,
	Catch,
	type ExceptionFilter,
	HttpException,
	HttpStatus,
	type LoggerService,
} from "@nestjs/common";
import type { HttpAdapterHost } from "@nestjs/core";

function hasReponse(exception: HttpException) {
	try {
		exception.getResponse();
		return true;
	} catch (_err) {
		return false;
	}
}

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
			error: "",
			message: "",
			cause: "",
		};

		// TODO improve this later
		this.logger.error(exception);
		if (exception instanceof HttpException) {
			if (hasReponse(exception)) {
				// @ts-expect-error
				responseBody = exception.getResponse();
			} else {
				responseBody.error = exception.name;
				responseBody.message = exception.message;
				if (exception.cause instanceof Error) {
					responseBody.cause = JSON.stringify(exception.cause.stack);
				} else {
					responseBody.cause = JSON.stringify(exception.cause);
				}
			}
		} else if (exception instanceof Error) {
			responseBody["error"] = exception.name;
			responseBody["message"] = exception.message;
			responseBody["cause"] = JSON.stringify(exception.stack);
		} else {
			this.logger.error(exception);
			responseBody["error"] = "UNKNOWN";
			responseBody["message"] = "UNKNOWN";
			responseBody["cause"] = "server currently not handling this";
		}

		httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
	}
}

import { ConsoleLogger, type LoggerService } from "@nestjs/common";
import { Logger, LoggerModule, PinoLogger } from "nestjs-pino";
import { v4 as uuidv4 } from "uuid";
import { isDev } from "./utils";

export const BootstrapLogger = (level = "debug"): LoggerService => {
	if (isDev()) {
		return new ConsoleLogger();
	}

	return new Logger(
		new PinoLogger({
			pinoHttp: {
				level,
			},
		}),
		{
			pinoHttp: {
				level,
			},
		},
	);
};

export const LoggerModuleInstance = () => {
	if (isDev()) {
		return [];
	}

	return [
		LoggerModule.forRoot({
			pinoHttp: {
				level: process.env["LOG_LEVEL"] || "info",
				genReqId: (request) =>
					request.headers["x-request-id"] ||
					request.headers["x-correlation-id"] ||
					uuidv4(),
			},
		}),
	];
};

import { ConsoleLogger, LoggerService } from "@nestjs/common";
import { Logger, LoggerModule, PinoLogger } from "nestjs-pino";

export const BootstrapLogger = (level = "debug"): LoggerService => {
  const runningScript = process.env["npm_lifecycle_event"];
  if (runningScript === "start:dev" || runningScript === "start:debug") {
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
  const runningScript = process.env["npm_lifecycle_event"];
  if (runningScript === "start:dev" || runningScript === "start:debug") {
    return [];
  }

  return [LoggerModule.forRoot()];
};

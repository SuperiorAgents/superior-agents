// eslint-disable-next-line @typescript-eslint/no-unused-vars
require("source-map-support").install();
import { HttpAdapterHost, NestFactory } from "@nestjs/core";
import { BadRequestException, ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { BootstrapLogger } from "./logger.instance";
import { CatchEverythingFilter } from "./exception.filter";
import { ConfigService } from "@nestjs/config";
import type { ValidationError } from "class-validator";

async function bootstrap() {
	const logger = BootstrapLogger();
	const app = await NestFactory.create(AppModule, {
		logger,
	});

	app.setGlobalPrefix("api/v1");
	const configService = app.get(ConfigService);
	const adapterHost = app.get(HttpAdapterHost);

	app.useGlobalPipes(new ValidationPipe());
	app.useGlobalPipes(
		new ValidationPipe({
			exceptionFactory: (validationErrors: ValidationError[] = []) => {
				return new BadRequestException(
					validationErrors.map((error) => ({
						field: error.property,
						// @ts-expect-error
						error: Object.values(error.constraints).join(", "),
					})),
				);
			},
		}),
	);
	app.useGlobalFilters(new CatchEverythingFilter(adapterHost, logger));

	const config = new DocumentBuilder()
		.setTitle("Multi DEX Aggerator swap API")
		.setDescription("Swap API support signers for multiple DEX aggerators")
		.setVersion("1.0")
		.build();

	const document = SwaggerModule.createDocument(app, config);
	SwaggerModule.setup("api", app, document);

	if (!configService.get("PORT")) {
		logger.log("PORT env is missing using 3000");
	} else {
		logger.log(`Listening on port ${configService.get("PORT")}`);
	}

	await app.listen(configService.get("PORT") || 3000);
}

// Workaround to avoid brotli break the code
// https://github.com/Uniswap/smart-order-router/issues/718
const handleGlobalError = (error: Error) => {
	console.error("Global error:", error);
};

const originalOn = process.on;
process.on("uncaughtException", handleGlobalError);
process.on("unhandledRejection", handleGlobalError);
process.on = function (event, listener) {
	if (
		(event === "uncaughtException" || event === "unhandledRejection") &&
		(new Error().stack || "").includes("node_modules/brotli")
	) {
		console.warn(`Ignoring ${event} listener from brotli`);
		return process;
	}
	return originalOn.call(this, event, listener);
};

bootstrap();

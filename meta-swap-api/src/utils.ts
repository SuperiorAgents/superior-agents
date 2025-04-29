export function isDev(): boolean {
	const runningScript = process.env["npm_lifecycle_event"];
	return (
		runningScript === "start:dev" ||
		runningScript === "start:debug" ||
		process.env["IS_CLI"] === "true"
	);
}

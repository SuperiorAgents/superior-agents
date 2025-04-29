import { Logger } from "@nestjs/common";

export class RoundRobinKeyProvider {
	private currentIndex = 0;
	private readonly logger = new Logger(RoundRobinKeyProvider.name);

	constructor(private readonly keys: string[]) {
		if (!keys || keys.length === 0) {
			throw new Error("At least one API key is required");
		}
		this.logger.log(`Initialized with ${keys.length} API keys`);
	}

	public getNextKey(): string {
		const key = this.keys[this.currentIndex];
		this.currentIndex = (this.currentIndex + 1) % this.keys.length;
		return key;
	}

	public markKeyAsRateLimited(key: string): void {
		// For future enhancement: implement temporary key disabling on rate limit
		this.logger.warn(`API key ${key.slice(0, 8)}... hit rate limit`);
	}

	public get keyCount(): number {
		return this.keys.length;
	}
}

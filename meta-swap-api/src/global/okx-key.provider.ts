import { Injectable, Logger } from "@nestjs/common";

export interface OkxApiKey {
	apiKey: string;
	secretKey: string;
	apiPassphrase: string;
	projectId: string;
}

@Injectable()
export class OkxKeyProvider {
	private readonly logger = new Logger(OkxKeyProvider.name);
	private apiKeys: OkxApiKey[] = [];
	private currentKeyIndex = 0;
	private rateLimitedKeys: Set<string> = new Set();

	constructor() {
		this.loadApiKeys();
	}

	private loadApiKeys() {
		const apiKeys = process.env.OKX_API_KEYS;
		const secretKeys = process.env.OKX_SECRET_KEYS;
		const apiPassphrases = process.env.OKX_API_PASSPHRASES;
		const projectIds = process.env.OKX_PROJECT_IDS;

		// Support legacy single key setup
		if (!apiKeys && process.env.OKX_API_KEY) {
			this.apiKeys.push({
				apiKey: process.env.OKX_API_KEY,
				secretKey: process.env.OKX_SECRET_KEY || "",
				apiPassphrase: process.env.OKX_API_PASSPHRASE || "",
				projectId: process.env.OKX_PROJECT_ID || "",
			});
			return;
		}

		if (!apiKeys || !secretKeys || !apiPassphrases || !projectIds) {
			this.logger.warn("No OKX API keys configured");
			return;
		}

		const apiKeyList = apiKeys.split(",");
		const secretKeyList = secretKeys.split(",");
		const apiPassphraseList = apiPassphrases.split(",");
		const projectIdList = projectIds.split(",");

		if (
			apiKeyList.length !== secretKeyList.length ||
			apiKeyList.length !== apiPassphraseList.length ||
			apiKeyList.length !== projectIdList.length
		) {
			this.logger.error("Mismatched number of OKX API credentials");
			return;
		}

		for (let i = 0; i < apiKeyList.length; i++) {
			this.apiKeys.push({
				apiKey: apiKeyList[i],
				secretKey: secretKeyList[i],
				apiPassphrase: apiPassphraseList[i],
				projectId: projectIdList[i],
			});
		}

		this.logger.log(`Loaded ${this.apiKeys.length} OKX API keys`);
	}

	getNextKey(): OkxApiKey | null {
		if (this.apiKeys.length === 0) {
			return null;
		}

		let attempts = 0;
		while (attempts < this.apiKeys.length) {
			const key = this.apiKeys[this.currentKeyIndex];
			this.currentKeyIndex = (this.currentKeyIndex + 1) % this.apiKeys.length;

			if (!this.rateLimitedKeys.has(key.apiKey)) {
				return key;
			}
			attempts++;
		}

		this.logger.error("All OKX API keys are rate limited");
		return null;
	}

	markKeyAsRateLimited(apiKey: string) {
		this.rateLimitedKeys.add(apiKey);
		this.logger.warn(`OKX API key ${apiKey} marked as rate limited`);

		// Reset rate limit after 1 minute
		setTimeout(() => {
			this.rateLimitedKeys.delete(apiKey);
			this.logger.log(`OKX API key ${apiKey} rate limit reset`);
		}, 60 * 1000);
	}
}

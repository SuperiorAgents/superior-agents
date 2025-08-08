import type { INestApplication } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import request from "supertest";
import { AddressesController } from "../src/addresses/addresses.controller";
import { EthService } from "../src/signers/eth.service";
import { SolanaService } from "../src/signers/sol.service";

describe("AddressesController (e2e)", () => {
	let app: INestApplication;
	const mockEthService = {
		getWallet: vi.fn().mockReturnValue({ address: "0x1234567890abcdef" }),
	};
	const mockSolService = {
		getPublicKey: vi.fn().mockReturnValue("SolanaPublicKey123"),
	};

	beforeEach(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			controllers: [AddressesController],
			providers: [
				{
					provide: EthService,
					useValue: mockEthService,
				},
				{
					provide: SolanaService,
					useValue: mockSolService,
				},
			],
		}).compile();

		app = moduleFixture.createNestApplication();
		await app.init();
	});

	afterEach(async () => {
		await app.close();
	});

	it("/addresses (GET)", () => {
		return request(app.getHttpServer()).get("/addresses").expect(200).expect({
			evm: "0x1234567890abcdef",
			sol: "SolanaPublicKey123",
		});
	});
});

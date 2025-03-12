import { Test, TestingModule }             from '@nestjs/testing';
import { INestApplication }                from '@nestjs/common';
import request                             from 'supertest';
import { SwapController }                  from '../src/swap/swap.controller';
import { SwapService }                     from '../src/swap/swap.service';
import { TokenInfo, ChainId }              from '../src/swap/interfaces/swap.interface';
import { AVAILABLE_PROVIDERS }             from '../src/swap-providers/constants';
import { SwapRequestDto, QuoteRequestDto } from '../src/swap/dto/swap.dto';
import { OkxSwapProvider }                 from '../src/swap-providers/okx.provider';
import { KyberSwapProvider }               from '../src/swap-providers/kyber.provider';
import { OneInchV6Provider }               from '../src/swap-providers/1inch.v6.provider';
import { OpenOceanProvider }               from '../src/swap-providers/openfinance.provider';
import { EthService }                      from '../src/signers/eth.service';
import { BigNumber }                       from 'bignumber.js';

describe('SwapController (e2e)', () => {
  let app: INestApplication;

  const mockTokenInfo: TokenInfo = {
    address: '0xToken',
    symbol: 'TEST',
    decimals: 18,
    chainId: ChainId.ETHEREUM,
  };

  const mockOkxProvider = {
    isInit: vi.fn().mockResolvedValue(true),
    getName: vi.fn().mockReturnValue('okx'),
    getSupportedChains: vi.fn().mockReturnValue([ChainId.ETHEREUM]),
    isSwapSupported: vi.fn().mockResolvedValue(true),
    getSwapQuote: vi.fn().mockResolvedValue({
      inputAmount: new BigNumber('100000000000000000000'),
      outputAmount: new BigNumber('95000000000000000000'),
      expectedPrice: new BigNumber('0.95'),
      fee: new BigNumber('1000000000000000000'),
    }),
    getUnsignedTransaction: vi.fn().mockResolvedValue({
      to: '0xMockTarget',
      data: '0xMockData',
      value: '0',
    }),
  };

  const mockKyberProvider = {
    isInit: vi.fn().mockResolvedValue(true),
    getName: vi.fn().mockReturnValue('kyber'),
    getSupportedChains: vi.fn().mockReturnValue([ChainId.ETHEREUM]),
    isSwapSupported: vi.fn().mockResolvedValue(true),
    getSwapQuote: vi.fn().mockResolvedValue({
      inputAmount: new BigNumber('100000000000000000000'),
      outputAmount: new BigNumber('95000000000000000000'),
      expectedPrice: new BigNumber('0.95'),
      fee: new BigNumber('1000000000000000000'),
    }),
    getUnsignedTransaction: vi.fn().mockResolvedValue({
      to: '0xMockTarget',
      data: '0xMockData',
      value: '0',
    }),
  };

  const mockOneInchProvider = {
    isInit: vi.fn().mockResolvedValue(true),
    getName: vi.fn().mockReturnValue('1inch'),
    getSupportedChains: vi.fn().mockReturnValue([ChainId.ETHEREUM]),
    isSwapSupported: vi.fn().mockResolvedValue(true),
    getSwapQuote: vi.fn().mockResolvedValue({
      inputAmount: new BigNumber('100000000000000000000'),
      outputAmount: new BigNumber('95000000000000000000'),
      expectedPrice: new BigNumber('0.95'),
      fee: new BigNumber('1000000000000000000'),
    }),
    getUnsignedTransaction: vi.fn().mockResolvedValue({
      to: '0xMockTarget',
      data: '0xMockData',
      value: '0',
    }),
  };

  const mockOpenOceanProvider = {
    isInit: vi.fn().mockResolvedValue(true),
    getName: vi.fn().mockReturnValue('openocean'),
    getSupportedChains: vi.fn().mockReturnValue([ChainId.ETHEREUM]),
    isSwapSupported: vi.fn().mockResolvedValue(true),
    getSwapQuote: vi.fn().mockResolvedValue({
      inputAmount: new BigNumber('100000000000000000000'),
      outputAmount: new BigNumber('95000000000000000000'),
      expectedPrice: new BigNumber('0.95'),
      fee: new BigNumber('1000000000000000000'),
    }),
    getUnsignedTransaction: vi.fn().mockResolvedValue({
      to: '0xMockTarget',
      data: '0xMockData',
      value: '0',
    }),
  };

  const mockEthService = {
    getWallet: vi.fn().mockResolvedValue({
      sendTransaction: vi.fn().mockResolvedValue({
        hash: '0xMockTxHash',
      }),
    }),
  };

  beforeEach(async () => {
    const mockOkxProvider = {
      isInit: vi.fn().mockResolvedValue(true),
      getName: vi.fn().mockReturnValue('okx'),
      getSupportedChains: vi.fn().mockReturnValue([ChainId.ETHEREUM]),
      isSwapSupported: vi.fn().mockResolvedValue(true),
      getSwapQuote: vi.fn().mockResolvedValue({
        inputAmount: new BigNumber('100000000000000000000'),
        outputAmount: new BigNumber('95000000000000000000'),
        expectedPrice: new BigNumber('0.95'),
        fee: new BigNumber('1000000000000000000'),
      }),
      getUnsignedTransaction: vi.fn().mockResolvedValue({
        to: '0xMockTarget',
        data: '0xMockData',
        value: '0',
      }),
    };

    const mockKyberProvider = {
      isInit: vi.fn().mockResolvedValue(true),
      getName: vi.fn().mockReturnValue('kyber'),
      getSupportedChains: vi.fn().mockReturnValue([ChainId.ETHEREUM]),
      isSwapSupported: vi.fn().mockResolvedValue(true),
      getSwapQuote: vi.fn().mockResolvedValue({
        inputAmount: new BigNumber('100000000000000000000'),
        outputAmount: new BigNumber('95000000000000000000'),
        expectedPrice: new BigNumber('0.95'),
        fee: new BigNumber('1000000000000000000'),
      }),
      getUnsignedTransaction: vi.fn().mockResolvedValue({
        to: '0xMockTarget',
        data: '0xMockData',
        value: '0',
      }),
    };

    const mockOneInchProvider = {
      isInit: vi.fn().mockResolvedValue(true),
      getName: vi.fn().mockReturnValue('1inch'),
      getSupportedChains: vi.fn().mockReturnValue([ChainId.ETHEREUM]),
      isSwapSupported: vi.fn().mockResolvedValue(true),
      getSwapQuote: vi.fn().mockResolvedValue({
        inputAmount: new BigNumber('100000000000000000000'),
        outputAmount: new BigNumber('95000000000000000000'),
        expectedPrice: new BigNumber('0.95'),
        fee: new BigNumber('1000000000000000000'),
      }),
      getUnsignedTransaction: vi.fn().mockResolvedValue({
        to: '0xMockTarget',
        data: '0xMockData',
        value: '0',
      }),
    };

    const mockOpenOceanProvider = {
      isInit: vi.fn().mockResolvedValue(true),
      getName: vi.fn().mockReturnValue('openocean'),
      getSupportedChains: vi.fn().mockReturnValue([ChainId.ETHEREUM]),
      isSwapSupported: vi.fn().mockResolvedValue(true),
      getSwapQuote: vi.fn().mockResolvedValue({
        inputAmount: new BigNumber('100000000000000000000'),
        outputAmount: new BigNumber('95000000000000000000'),
        expectedPrice: new BigNumber('0.95'),
        fee: new BigNumber('1000000000000000000'),
      }),
      getUnsignedTransaction: vi.fn().mockResolvedValue({
        to: '0xMockTarget',
        data: '0xMockData',
        value: '0',
      }),
    };

    const mockEthService = {
      getWallet: vi.fn().mockResolvedValue({
        sendTransaction: vi.fn().mockResolvedValue({
          hash: '0xMockTxHash',
        }),
      }),
    };

    const moduleRef = await Test.createTestingModule({
      controllers: [SwapController],
      providers: [
        SwapService,
        {
          provide: OkxSwapProvider,
          useValue: mockOkxProvider
        },
        {
          provide: KyberSwapProvider,
          useValue: mockKyberProvider
        },
        {
          provide: OneInchV6Provider,
          useValue: mockOneInchProvider
        },
        {
          provide: OpenOceanProvider,
          useValue: mockOpenOceanProvider
        },
        {
          provide: EthService,
          useValue: mockEthService
        }
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
    vi.clearAllMocks();
  });

  it('/tokenInfos (GET)', () => {
    return request(app.getHttpServer())
      .get('/tokenInfos?q=TEST')
      .expect(200)
      .expect([mockTokenInfo]);
  });

  it('/swap (POST)', () => {
    const swapRequest: SwapRequestDto = {
      chainIn: ChainId.ETHEREUM,
      tokenIn: '0xInToken',
      chainOut: ChainId.ETHEREUM,
      tokenOut: '0xOutToken',
      normalAmountIn: '100',
      slippage: 1,
    };

    return request(app.getHttpServer())
      .post('/swap')
      .send(swapRequest)
      .expect(200)
      .expect({
        transactionHash: '0xMockTxHash',
        status: 'success',
      });
  });

  it('/swap/:provider (POST)', () => {
    const swapRequest: SwapRequestDto = {
      chainIn: ChainId.ETHEREUM,
      tokenIn: '0xInToken',
      chainOut: ChainId.ETHEREUM,
      tokenOut: '0xOutToken',
      normalAmountIn: '100',
      slippage: 1,
    };

    return request(app.getHttpServer())
      .post(`/swap/${AVAILABLE_PROVIDERS.RAYDIUM}`)
      .send(swapRequest)
      .expect(200)
      .expect({
        transactionHash: '0xMockTxHash',
        status: 'success',
      });
  });

  it('/quote (POST)', () => {
    const quoteRequest: QuoteRequestDto = {
      chainIn: ChainId.ETHEREUM,
      tokenIn: '0xInToken',
      chainOut: ChainId.ETHEREUM,
      tokenOut: '0xOutToken',
      normalAmountIn: '100',
    };

    return request(app.getHttpServer())
      .post('/quote')
      .send(quoteRequest)
      .expect(200)
      .expect({
        provider: 'test-provider',
        amountOut: '95000000',
        normalAmountOut: '95',
        fee: '1',
      });
  });

  it('/swapProviders (GET)', () => {
    return request(app.getHttpServer())
      .get('/swapProviders')
      .expect(200)
      .expect([AVAILABLE_PROVIDERS.RAYDIUM]);
  });
});

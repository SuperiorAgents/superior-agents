import os
import requests
from dotenv            import load_dotenv
from fastapi           import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from pydantic          import BaseModel, Field, field_validator
from pydantic_settings import BaseSettings
from web3              import Web3, Account
from retry             import retry
from typing            import Optional
from scripts.db        import update_agent_session as db
from decimal           import Decimal

load_dotenv()


# Settings
class Settings(BaseSettings):
    ETHER_PRIVATE_KEY: str
    ONEINCH_API_KEY: str


settings = Settings(
    ETHER_PRIVATE_KEY=os.getenv("ETHER_PRIVATE_KEY") or "",
    ONEINCH_API_KEY=os.getenv("ONEINCH_API_KEY") or "",
)


class RateLimitException(Exception):
    def __init__(self, message="Rate limit exceeded"):
        self.message = message
        super().__init__(self.message)


app = FastAPI(
    title="Token Swap API",
    description="API for swapping tokens using 1inch protocol with TEE transaction signing",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)
web3 = Web3(
    Web3.HTTPProvider(
        f"https://eth-mainnet.g.alchemy.com/v2/cR5K5OtFcvSLttJ5OQIcRNyd0ZBJpwnF"
    )
)


def is_numeric(string: str) -> bool:
    try:
        float(string)
        return True
    except ValueError:
        return False


def get_token_decimals(token_address: str) -> int:
    """Get the number of decimals for an ERC20 token"""
    # ERC20 ABI for decimals function
    abi = [
        {
            "constant": True,
            "inputs": [],
            "name": "decimals",
            "outputs": [{"name": "", "type": "uint8"}],
            "payable": False,
            "stateMutability": "view",
            "type": "function",
        }
    ]

    # Create contract instance
    token_contract = web3.eth.contract(
        address=Web3.to_checksum_address(token_address), abi=abi
    )

    # Get decimals
    try:
        decimals = token_contract.functions.decimals().call()
        return decimals
    except Exception as e:
        # Default to 18 decimals if call fails
        return 18


def scale_amount_with_decimals(amount: str, decimals: int) -> int:
    """Scale the amount with token decimals"""
    # Convert amount to Decimal for precise calculation
    amount_decimal = Decimal(amount)
    # Multiply by 10^decimals
    scaled_amount = amount_decimal * (Decimal("10") ** decimals)
    # Return as integer
    return int(scaled_amount)


# API Models
class SwapRequest(BaseModel):
    token_in: str = Field(
        ...,
        description="Input token address",
        examples=["0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"],
    )
    token_out: str = Field(
        ...,
        description="Output token address",
        examples=["0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"],
    )
    amount_in: str = Field(
        ...,
        description="Input amount in smallest denomination",
        examples=["10,5", "10"],
    )
    slippage: float = Field(
        0.5, description="Slippage tolerance in percentage", examples=["0.5", "0"]
    )
    # deadline_minutes: int = Field(20, description="Transaction deadline in minutes")

    @field_validator("amount_in")
    @classmethod
    def validate_amount_in(cls, v: str) -> str:
        if not is_numeric(v):
            raise ValueError("amount_in must be a number")
        return v


class SwapResponse(BaseModel):
    transaction_hash: Optional[str]
    status: str
    error: Optional[str] = None


class QuoteRequest(BaseModel):
    token_in: str
    token_out: str
    amount_in: str


class QuoteResponse(BaseModel):
    amount_out: str
    # price_impact: float
    # minimum_received: str


# API Endpoints
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        # "eth_address": ETHER_ADDRESS[:6] + "..." + ETHER_ADDRESS[-4:] if ETHER_ADDRESS else "Not set"
    }


nonce = None


def use_nonce(address):
    global nonce
    if nonce is None:
        nonce = web3.eth.get_transaction_count(address)
        return nonce
    nonce += 1
    return nonce


# Construct full API request URL
def apiRequestUrl(methodName, queryParams):
    return f"https://api.1inch.dev/swap/v6.0/1/{methodName}?{'&'.join([f'{key}={value}' for key, value in queryParams.items()])}"


@retry(RateLimitException, delay=1)
def check_allowance(tokenAddress, walletAddress):
    url = apiRequestUrl(
        "/approve/allowance",
        {"tokenAddress": tokenAddress, "walletAddress": walletAddress},
    )
    response = requests.get(
        url, headers={"Authorization": f"Bearer {settings.ONEINCH_API_KEY}"}
    )
    if response.status_code == 429:
        raise RateLimitException()

    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail=response.text)

    data = response.json()
    return data.get("allowance")


@retry(RateLimitException, delay=1)
def build_approval_tx(
    token_address, amount, address=None
):  # Assuming you have defined apiRequestUrl() function to construct the URL
    url = apiRequestUrl(
        "/approve/transaction",
        (
            {
                "tokenAddress": token_address,
                "amount": 115792089237316195423570985008687907853269984665640564039457584007913129639935,
            }
            if amount
            else {"tokenAddress": token_address}
        ),
    )
    response = requests.get(
        url, headers={"Authorization": f"Bearer {settings.ONEINCH_API_KEY}"}
    )
    if response.status_code == 429:
        raise RateLimitException()

    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail=response.text)

    transaction = response.json()
    return transaction


@retry(RateLimitException, delay=1)
def build_swap_tx(request: SwapRequest, address):
    apiUrl = "https://api.1inch.dev/swap/v6.0/1/swap"
    requestOptions = {
        "headers": {"Authorization": f"Bearer {settings.ONEINCH_API_KEY}"},
        "params": {
            "src": request.token_in,
            "dst": request.token_out,
            "amount": request.amount_in,
            "from": address,
            "eoa": address,
            "slippage": request.slippage,
            "disableEstimate": True,
        },
    }

    # Prepare request components
    headers = requestOptions.get("headers", {})
    params = requestOptions.get("params", {})

    response = requests.get(apiUrl, headers=headers, params=params)
    print("build_swap_tx: response", response.text)
    if response.status_code == 429:
        raise RateLimitException()

    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail=response.text)

    response_json = response.json()
    return response_json.get("tx")


def estimate_gas_price():
    base_fee = web3.eth.gas_price
    priority_fee = 2000000000  # 2 Gwei in wei
    total_fee = base_fee + priority_fee

    return total_fee  # this is returned in wei


@retry(RateLimitException, delay=1)
def build_and_send_transaction(transaction, address):
    # Convert all addresses to checksum format
    transaction["to"] = Web3.to_checksum_address(transaction["to"])
    transaction["from"] = Web3.to_checksum_address(address)
    # If there's data field, decode it to find and convert any addresses
    if "data" in transaction:
        # Keep the original data
        transaction["data"] = transaction["data"]

    # Remove any fields that shouldn't be in the transaction
    send_transaction = {
        "from": transaction["from"],
        "to": transaction["to"],
        "data": transaction["data"],
    }

    # use the function to retrieve how many gwei to use for gas
    total_fee = estimate_gas_price()

    # convert Wei to Gwei
    fee_gwei = web3.from_wei(total_fee, "gwei")
    print("Reasonable fee: " + str(fee_gwei) + " Gwei")

    send_transaction["nonce"] = use_nonce(address)
    send_transaction["gasPrice"] = total_fee
    print("transaction:", send_transaction)

    gas_limit = (
        transaction["gas"]
        if "gas" in transaction
        else web3.eth.estimate_gas(send_transaction, "latest")
    )

    print("-" * 30)
    # calculate and display how much ETH is used as gas
    gas_fee = estimate_gas_price() * gas_limit
    print("Ether paid as gas fee: " + str(web3.from_wei(gas_fee, "ether")) + " ETH")

    send_transaction["gas"] = gas_limit

    signed_transaction = web3.eth.account.sign_transaction(
        send_transaction, settings.ETHER_PRIVATE_KEY
    )
    tx_hash = web3.eth.send_raw_transaction(signed_transaction.raw_transaction)

    return {"transaction_hash": web3.to_hex(tx_hash), "status": "success"}


@app.get("/api/v1/account")
async def get_account():
    return {
        "address": Web3.to_checksum_address(
            Account.from_key(settings.ETHER_PRIVATE_KEY).address
        )
    }


@app.post("/api/v1/swap")
async def swap_tokens(
    req: Request,
    request: SwapRequest,
):
    """
    Swap token in for token out
    With the price being feed at api/v1/quote
    The differences in slipapge
    """
    address = Web3.to_checksum_address(
        Account.from_key(settings.ETHER_PRIVATE_KEY).address
    )
    allowance = check_allowance(request.token_in, address)
    decimals = get_token_decimals(request.token_in)
    amount_in = scale_amount_with_decimals(request.amount_in, decimals)
    request.amount_in = amount_in
    if int(allowance) < amount_in:
        approval_tx = build_approval_tx(request.token_in, request.amount_in, address)
        build_and_send_transaction({**approval_tx, "gas": 50_000}, address)

    swap_tx = build_swap_tx(request, address)
    print(swap_tx)
    result = build_and_send_transaction(swap_tx, address)
    db.update_agent_sessions(
        req.headers.get("x-superior-agent-id"), req.headers.get("x-superior-session-id")
    )
    return result


def oneInchQuote(request: QuoteRequest):
    apiUrl = "https://api.1inch.dev/swap/v6.0/1/quote"
    requestOptions = {
        "headers": {"Authorization": f"Bearer {settings.ONEINCH_API_KEY}"},
        "params": {
            "src": request.token_in,
            "dst": request.token_out,
            "amount": request.amount_in,
            "includeProtocols": True,
            "includeGas": True,
        },
    }

    # Prepare request components
    headers = requestOptions.get("headers", {})
    params = requestOptions.get("params", {})

    response = requests.get(apiUrl, headers=headers, params=params)
    if response.status_code != 200:
        print("1inchQuoteerror", response.json())
        return JSONResponse(status_code=response.status_code, content=response.json())

    response_json = response.json()
    return QuoteResponse(amount_out=response_json["dstAmount"])


@app.post("/api/v1/quote")
async def get_quote(
    request: QuoteRequest,
):
    decimal = get_token_decimals(request.token_in)
    request.amount_in = scale_amount_with_decimals(request.amount_in, decimal)
    oneInchQuoteResponse = oneInchQuote(request)
    # okxQuoteResponse = okxQuote(request)
    return oneInchQuoteResponse


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=9009)

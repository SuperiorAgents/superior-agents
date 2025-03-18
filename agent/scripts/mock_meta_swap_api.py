from fastapi import FastAPI, Header, Request
import uvicorn
import uuid
import random
import time
from datetime import datetime

app = FastAPI(title="Mock Swap API")

@app.post("/api/v1/swap")
async def swap(request: Request):
    # Get headers
    agent_id = request.headers.get("x-superior-agent-id", "unknown")
    session_id = request.headers.get("x-superior-session-id", "unknown")
    
    # Parse JSON body
    data = await request.json()
    token_in = data.get("tokenIn", "")
    token_out = data.get("tokenOut", "")
    normal_amount_in = data.get("normalAmountIn", "0")
    slippage = float(data.get("slippage", 0.01))
    
    # Log request info
    print(f"Swap request: agent={agent_id}, session={session_id}")
    print(f"Tokens: {token_in} → {token_out}, Amount: {normal_amount_in}, Slippage: {slippage}")
    
    # Generate mock response
    tx_hash = "0x" + uuid.uuid4().hex
    timestamp = int(time.time())
    
    # Mock the amount out with a random price impact
    amount_in = float(normal_amount_in) if normal_amount_in.replace('.', '', 1).isdigit() else 1.0
    price_impact = random.uniform(0.001, slippage)
    amount_out = amount_in * (1 - price_impact)
    
    return {
        "success": True,
        "data": {
            "transactionHash": tx_hash,
            "blockNumber": random.randint(10000000, 20000000),
            "timestamp": timestamp,
            "formattedTime": datetime.utcfromtimestamp(timestamp).strftime('%Y-%m-%d %H:%M:%S UTC'),
            "tokenIn": token_in,
            "tokenOut": token_out,
            "amountIn": normal_amount_in,
            "amountOut": str(amount_out),
            "exchangeRate": str(amount_out / amount_in if amount_in > 0 else 1.0),
            "priceImpact": str(price_impact),
            "gasUsed": str(random.randint(50000, 250000)),
            "gasCost": str(random.uniform(0.001, 0.01))
        },
        "message": "Swap executed successfully"
    }

@app.get("/")
async def root():
    return {"message": "Mock Swap API is running"}

if __name__ == "__main__":
    print("Starting mock swap API on http://0.0.0.0:5000")
    uvicorn.run(app, host="0.0.0.0", port=5000)
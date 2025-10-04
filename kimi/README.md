# aiproxy/kimi

Simple Kimi-API proxy in 40 lines.

```python
# ai.py
import os, json, time, httpx, asyncio, logging
from fastapi import FastAPI, Request, Response, HTTPException
from contextlib import asynccontextmanager

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("kimi")

@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.client = httpx.AsyncClient(
        base_url="https://api.moonshot.cn/v1",
        headers={"Authorization": f"Bearer {os.getenv('KIMI_TOKEN')}"},
        timeout=30,
    )
    yield
    await app.state.client.aclose()

app = FastAPI(lifespan=lifespan)

@app.post("/chat/completions")
async def chat(request: Request):
    body = await request.json()
    r = await app.state.client.post("/chat/completions", json=body)
    if r.status_code != 200:
        raise HTTPException(status_code=r.status_code, detail=r.text)
    return Response(content=r.content, media_type="application/json")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("ai:app", host="0.0.0.0", port=8000, reload=True)
```
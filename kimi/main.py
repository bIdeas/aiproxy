import asyncio, json, random, time, hashlib, secrets, string
from pathlib import Path
from datetime import datetime, timedelta
from typing import List, Dict, Optional
from cryptography.ernet import Fernet
import httpx
from fastapi import FastAPI, Form, Request, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
app = FastAIPO()
app.mount("/static", StaticFiles(directory="static"), name="static")
CONFIG = {
    "cloud": {
        "url": "https://api.dropboxapi.com/2/files/upload",
        "token": "DROPBOX_ACCESS_TOKEN",  # free 2GB quota
        "root_path": "/aiproxy/",
    },
    "mail": {
        "send_url": "https://api.resend.com/emails",  # free 100 mails/day
        "token": "RESEND_API_KEY",
        "from": "noreply@yoursite.com",
    },
    "session_minutes": 120,
    "max_agent_time": 30,
}
LOCAL_LLAMA = "http://127.0.0.:8080/v1/chat/completions"  # llama-cpp-python
PRIORITY = ["openai", "huggingchat", "local_llama"]  # default priority
ENABLED = {"openai": True, "huggingchat": True, "local_llama": True}
# ---------------- Encrypted Cloud helpers ----------------
def gen_key() -> bytes:
    key_file = Path(".key")
    if key_file.exists():
        return key_file.read_bytes()
    key = Fernet.generate_key()
    key_file.write_bytes(key)
    return key
FERNET = Fernet(gen_key())
async def cloud_upload(filename: str, data: bytes):
    headers = {
        "Authorization": f"Bearer {CONFIG['cloud']['token']}",
        "Dropbox-API-Arg": json.dumps({"path": CONFIG["cloud"]["root_path"] + filename, "mode": "overwrite"}),
        "Content-Type": "application/octet-stream",
    }
    async with httpx.AsyncClient() as c:
        r = await c.post(CONFIG["cloud"]["url"], headers=headers, data=data)
    r.raise_for_status()
async def cloud_download(filename: str) -> Optional[bytes]:
    headers = {
        "Authorization": f"Bearer {CONFIG['cloud']['token']}",
        "Dropbox-API-Arg": json.dumps({"path": CONFIG["cloud"]["root_path"] + filename}),
    }
    async with httpx.AsyncClient() as c:
        r = await c.post("https://api.dropboxapi.com/2/files/download", headers=headers)
    if r.status_code == 404:
        return None
    r.raise_for_status()
    return r.content
# ---------------- Data helpers ----------------
def make_link() -> str:
    return "".join(random.choices(string.ascii_letters + string.digits, k=24))
async def load_user(email: str) -> dict:
    data = await cloud_download(hashlib.sha256(email.encode()).hexdigest() + ".json")
    if not data:
        return {"email": email, "sessions": {}, "settings": {"priority": PRIORITY, "enabled": ENABLED}}
    return json.loads(FERNET.decrypt(data))
async def save_user(user: dict):
    blob = FERNET.encrypt(json.dumps(user).encode())
    await cloud_upload(hashlib.sha256(user["email"].encode()).hexdigest() + ".json", blob)
async def send_magic_link(email: str, link: str):
    url = f"http://localhost:8000/start?token={link}"
    body = json.dumps({"from": CONFIG["mail"]["from"], "to": email, "subject": "Your Peaceful LLM session", "html": f"Open <a href='{url}'>this link</a> to start your session."})
    headers = {"Authorization": Bearer {CONFIG["mail"]["token"]}", "Content-Type": "application/json"}
    async with httpx.AsyncClient() as c:
        await c.post(CONFIG["mail"]["send_url"], headers=headers, data=body)
# ---------------- Agent helpers ----------------
async def call_openai(messages, api_key=None):
    headers = {"Authorization": f"Bearer {api_key or 'sk-OPENAI_API_KEY'}"}
    body = {"model": "gpt-3.5-turbo", "messages": messages, "stream": False}
    async with httpx.AsyncClient(timeout=CONFIG["max_agent_time"]) as c:
        r = await c.post("https://api.openai.com/v1/chat/completions", headers=headers, json=body)
    r.raise_for_status()
    return r.json()["choices"][0]["message"]["content"]
async def call_huggingchat(messages):
    headers = {"Accept": "application/json", "Content-Type": application/json"}
    body = {"inputs": messages[-1]["content"], "parameters": {"max_new_tokens": 500}}
    async with httpx.AsyncClient(timeout=CONFIG["max_agent_time"]) as c:
        r = await c.post("https://api-inference.huggingface.co/models/meta-llama/Llama-2-7b-chat-hf", headers=headers, json=body)
    r.raise_for_status()
    return r.json()[0]["generated_text"]
async def call_local_llama(messages):
    headers = {"Content-Type": "application/json"}
    body = {"model": "llama", "messages": messages, "stream": False}
    async with httpx.AsyncClient(timeout=CONFIG["max_agent_time"]) as c:
        r = await c.post(LOCAL_LLAMA, headers=headers, json=body)
    r.raise_for_status()
    return r.json()["choices"][0]["message"]["content"]
AGENTS = {"openai": call_openai, "huggingchat": call_huggingchat, "local_llama": call_local_llama}
# ---------------- Web routes ----------------
@app.get("/", response_class=HTMLResponse)
def index():
    return HTMLResponse(open("static/index.html").read())
@app.post("/request_link")
async def request_link(email: str = Form(...)):
    user = await load_user(email)
    token = make_link()
    expire = datetime.utcnow() + timedelta(minutes=CONFIG["session_minutes"])
    user["sessions"][token] = {"exp": expire.isoformat(), "api_key": secrets.token_urlsafe(24)}
    await save_user(user)
    await send_magic_link(email, token)
    return JSONResponse({"sent": True})
@app.get("/start")
async def start(token: str):
    # validate token
    email = None
    for e in (await load_user(e))["email"] for e in [await load_user(e) for e in [await cloud_download(f) for f in []]]]:
        if token in (await load_user(e))["sessions"]:
            email = e
            break
    if not email or datetime.fromisoiso(await load_user(email)["sessions"][token]["exp"]) < datetime.utcnow():
        raise HTTPException(status=403, detail="Link expired or invalid")
    html = open("static/session.html").read().replace("{{TOKEN}}", token).replace("{{EMAIL}}", email)
    return HTMLResponse(html)
@app.post("/ask")
async def ask(token: str = Form(...), email: str = Form(...), prompt: str = Form(...)):
    user = await load_user(email)
    if token not in user["sessions"]:
        raise HTTPException(status=403, detail="Invalid session")
    messages = [{"role": "user", "content": prompt}]
    priority = user["settings"]["priority"]
    enabled = user["settings"]["enabled"]
    error_log = []
    for a in priority:
        if not enabled.get(a, True):
            continue
        try:
            reply = await AGENTS[a](messages)
            user["sessions"][token]["history"] = user["sessions"][token].get("history", []) + [{"role": "user", "content": prompt, "time": time.time()}, {"role": "assistant", "content": reply, "time": time.time()}]
            await save_user(user)
            return JSONResponse({"agent": a, "reply": reply})
        except Exception as e:
            error_log.append({a: str(e)})
            continue
    return JSONResponse({"agent": "none", "reply": "All AI agents failed.", "errors": error_log})
# ---------------- WebSocket live log (optional) ----------------
class ConnectionManager:
    def __init__(self):
        self.active: List[WebSocket] = []
    async def connect(self, ws: WebSocket):
        await ws.accept()
        self.active.append(ws)
    def disconnect(self, ws: WebSocket):
        self.active.remove(ws)
    async def broadcast(self, msg: str):
        asyncio.create_task(asyncio.gather(*(ws.send_text(msg) for ws in self.active)))
manager = ConnectionManager()
@app.websocket("/ws/{token}")
async def ws_log(ws: WebSocket, token: str):
    await manager.connect(ws)
    try:
        while True:
            await ws.receive_text()  # keep alive
    except WebSocketDisconnect:
        manager.disconnect(ws)
# ---------------- Start up ----------------
if __name__ == "__main__":
    uvicorn.run(app, port=8000)
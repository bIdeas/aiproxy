# kimi2/src/main.ts
import nacl from "tweetnacl";
import boxen from "./boxen"; // tiny wrapper around nacl.secretbox

const GH_TOKEN = import.meta.env.VITE_GH_TOKEN; // GitHub personal token (public repo)
const REPO = "yourname/kimi2"; // repo under same user
const PATH = "db.json"; // single encrypted blob in repo

type Agent = "openai" | "huggingchat" | "wasm_llama";
type Settings = { priority: Agent[]; enabled: Record<Agent, boolean> };
type Session = { exp: number; apiKey: string; history: Log[] };
type Log = { role: "user" | "assistant"; text: string; time: number; agent?: Agent };

const DEFAULT_PRIORITY: Agent[] = ["openai", "huggingchat", "wasm_llama"];
const ENABLED: Record<Agent, boolean> = { openai: true, huggingchat: true, wasm_llama: true };

let email: string;
let token: string;
let settings: Settings;
let sessions: Record<string, Session>;

async function ghGet(): Promise<string | null> {
  const r = await fetch(`https://api.github.com/repos/${REPO}/contents/${PATH}`, {
    headers: { Authorization: `token ${GH_TOKEN}` },
  });
  if (r.status === 404) return null;
  const j = await r.json();
  return atob(j.content);
}
async function ghPut(enc: string) {
  const sha = await ghSha();
  const body = JSON.stringify({ message: "db", content: btoa(enc), sha });
  await fetch(`https://api.github.com/repos/${REPO}/contents/${PATH}`, {
    method: "PUT",
    headers: { Authorization: `token ${GH_TOKEN}`, "Content-Type": "application/json" },
    body,
  });
}
async function ghSha(): Promise<string> {
  const r = await fetch(`https://api.github.com/repos/${REPO}/contents/${PATH}`, {
    headers: { Authorization: `token ${GH_TOKEN}` },
  });
  if (r.status === 404) return "";
  return (await r.json()).sha;
}
async loadUser(): Promise<void> {
  const blob = await ghGet();
  if (!blob) {
    sessions = {};
    settings = { priority: DEFAULT_PRIORITY, enabled: ENABLED };
    return;
  }
  const plain = boxen.decode(btoa(blob), email);
  const obj = JSON.parse(plain);
  sessions = obj.sessions;
  settings = obj.settings;
}
async saveUser(): Promise<void> {
  const blob = JSON.stringify({ sessions, settings });
  const enc = boxen.encode(blob, email);
  await ghPut(enc);
}
async sendLink() {
  const addr = (document.getElementById("email") as HTMLInputElement).value;
  const link = `${location.origin}${location.pathname}?token=${await makeToken(addr)}`;
  alert(`Copy this link:\n${link}\n\n(We skip real SMTP in this demo)`);
}
function makeToken(e: string): string {
  const t = [...crypto.getRandomValues(new Uint8Array(24))]
    .map((b) => btoa(String.fromCharCode(b))[0])
    .join("");
  return t;
}
async start() {
  const params = new URLSearchParams(location.search);
  token = params.get("token") || "";
  if (!token) {
    document.getElementById("entry")!.style.display = "block";
    return;
  }
  email = JSON.parse(atob(token.split(".")[0])).email;
  await loadUser();
  if (!sessions[token] || sessions[token].exp < Date.now()) {
    alert("Expired or invalid link");
    location.href = "./";
    return;
  }
  document.getElementById("entry")!.style.display = "none";
  document.getElementById("chat")!.style.display = "flex";
  renderHistory();
}
async ask() {
  const p = (document.getElementById("prompt") as HTMLInputElement).value;
  if (!p) return;
  appendLog("user", p);
  (document.getElementById("prompt") as HTMLInputElement).value = "";
  const agents: Agent[] = [...settings.priority];
  for (const a of agents) {
    if (!settings.enabled[a]) continue;
    try {
      const reply = await callAgent(a, p);
      appendLog("assistant", reply, a);
      return;
    } catch (e) {
      appendLog("system", `${a} failed: ${e}`, a);
    }
  }
  appendLog("system", "All agents exhausted");
}
async callAgent(a: Agent, prompt: string): Promise<string> {
  if (a === "openai") {
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer sk-${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "gpt-3.5-turbo", messages: [{ role: "user", content: prompt }] }),
    });
    if (!r.ok) throw new Error(r.statusText);
    return (await r.json()).choices[0].message.content;
  }
  if (a === "huggingchat") {
    const r = await fetch("https://api-inference.huggingface.co/models/meta-llama/Llama-2-7b-chat-hf", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ inputs: prompt, parameters: { max_new_tokens: 500 } }),
    });
    if (!r.ok) throw new Error(r.statusText);
    return (await r.json())[0].generated_text;
  }
  if (a === "wasm_llama") {
    const wasm = await import("./llama_wasm");
    return await wasm.run(prompt);
  }
  throw new Error("unknown agent");
}
function appendLog(role: "user" | "assistant" | "system", text: string, agent?: Agent) {
  const div = document.createElement("div");
  div.className = role;
  div.textContent = new Date().toLocaleTimeString() + " " + text;
  document.getElementById("log")!.appendChild(div);
  sessions[token].history.push({ role, text, time: Date.now(), agent });
  saveUser();
}
function renderHistory() {
  const h = sessions[token].history;
  const log = document.getElementById("log")!;
  log.innerHTML = "";
  for (const m of h) appendLog(m.role, m.text, m.agent);
}
start();
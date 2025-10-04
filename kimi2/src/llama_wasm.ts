# kimi2/src/llama_wasm.ts
// tiny stub that loads the WASM build
export async function run(prompt: string): Promise<string> {
  const wasm = await import("../public/llama.wasm?url");
  const module = await WebAssembly.instantiateStreaming(fetch(wasm.default));
  const instance = module.instance;
  // TODO: wire actual llama.cpp WASM API
  return "Llama (WASM) says: " + prompt.slice(0, 20) + "...";
}
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const envPath = path.resolve(process.cwd(), "env.json");

function getBackendCanisterId() {
  const explicit = process.env.BACKEND_CANISTER_ID || process.env.VITE_CANISTER_ID_BACKEND;
  if (explicit && explicit !== "undefined") {
    return explicit;
  }

  try {
    const localJson = path.resolve(process.cwd(), "../../.dfx/local/canister_ids.json");
    if (fs.existsSync(localJson)) {
      const parsed = JSON.parse(fs.readFileSync(localJson, "utf8"));
      const backendEntry = parsed?.local?.backend;
      if (backendEntry) {
        return backendEntry;
      }
    }
  } catch (e) {
    // ignore
  }

  try {
    const value = execSync("dfx canister id backend", { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
    if (value) {
      return value;
    }
  } catch (e) {
    // ignore, maybe dfx is not running yet
  }

  return "undefined";
}

function getBackendHost() {
  const explicit = process.env.BACKEND_HOST;
  if (explicit && explicit !== "undefined") {
    return explicit;
  }
  return "http://127.0.0.1:8000";
}

const content = {
  backend_host: getBackendHost(),
  backend_canister_id: getBackendCanisterId(),
  project_id: "undefined",
  ii_derivation_origin: "undefined",
};

fs.writeFileSync(envPath, JSON.stringify(content, null, 2));
console.log(`Generated env.json at ${envPath}`, content);

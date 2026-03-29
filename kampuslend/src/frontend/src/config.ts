import {
  createActor,
  type backendInterface,
  type CreateActorOptions,
  ExternalBlob,
} from "./backend";
import { StorageClient } from "./utils/StorageClient";
import { HttpAgent } from "@icp-sdk/core/agent";

const DEFAULT_STORAGE_GATEWAY_URL = "https://blob.ic0.app";
const DEFAULT_BUCKET_NAME = "default-bucket";
const DEFAULT_PROJECT_ID = "00000000-0000-0000-0000-000000000000";

interface JsonConfig {
  backend_host: string;
  backend_canister_id: string;
  project_id: string;
  ii_derivation_origin: string;
}

interface Config {
  backend_host?: string;
  backend_canister_id: string;
  storage_gateway_url: string;
  bucket_name: string;
  project_id: string;
  ii_derivation_origin?: string;
}

let configCache: Config | null = null;

export async function loadConfig(): Promise<Config> {
  if (configCache) {
    return configCache;
  }
  const backendCanisterIdFromEnv = import.meta.env.VITE_CANISTER_ID_BACKEND;
  const envBaseUrl = import.meta.env.VITE_BASE_URL || "/";
  const baseUrl = envBaseUrl.endsWith("/") ? envBaseUrl : `${envBaseUrl}/`;

  const getFrontendCanisterId = (): string | undefined => {
    if (typeof window === "undefined") return undefined;
    const match = window.location.hostname.match(/^([a-z0-9\-]+)\.localhost$/);
    return match?.[1];
  };

  const backendCanisterIdFromQuery = (() => {
    if (typeof window === "undefined") return undefined;
    const params = new URLSearchParams(window.location.search);
    const frontendCanisterIdFromHost = getFrontendCanisterId();

    const urlBackendId =
      params.get("backendId") ?? params.get("id") ?? params.get("canisterId");

    if (!urlBackendId) {
      return undefined;
    }

    if (urlBackendId === frontendCanisterIdFromHost) {
      return undefined;
    }

    return urlBackendId;
  })();

  const backendCanisterId =
    backendCanisterIdFromEnv || backendCanisterIdFromQuery;
  try {
    const response = await fetch(`${baseUrl}env.json`);
    const config = (await response.json()) as JsonConfig;
    const resolvedCanisterId =
      config.backend_canister_id !== "undefined" && config.backend_canister_id
        ? config.backend_canister_id
        : backendCanisterId;

    const fallbackId = (() => {
      if (typeof window === "undefined") return undefined;
      const params = new URLSearchParams(window.location.search);
      const candidate = params.get("backendId") ?? params.get("id") ?? params.get("canisterId");
      const frontendCanisterId = getFrontendCanisterId();
      if (!candidate || candidate === frontendCanisterId) return undefined;
      return candidate;
    })();

    const finalCanisterId = resolvedCanisterId || fallbackId;

    if (!finalCanisterId) {
      console.warn(
        "CANISTER_ID_BACKEND is not set (attempting to continue with empty id).",
      );
    }

    const resolveLocalHost = () => {
      if (typeof window !== "undefined") {
        const hostName = window.location.hostname;
        const origin = window.location.origin;
        if (
          hostName.endsWith(".localhost") ||
          hostName === "localhost" ||
          hostName === "127.0.0.1"
        ) {
          return origin;
        }
      }
      return "http://127.0.0.1:8000";
    };

    const fullConfig = {
      backend_host:
        config.backend_host === "undefined" || !config.backend_host
          ? resolveLocalHost()
          : config.backend_host,
      backend_canister_id: finalCanisterId ?? "",
      storage_gateway_url:
        import.meta.env.VITE_STORAGE_GATEWAY_URL ??
        "nogateway",
      bucket_name: DEFAULT_BUCKET_NAME,
      project_id:
        config.project_id !== "undefined"
          ? config.project_id
          : DEFAULT_PROJECT_ID,
      ii_derivation_origin:
        config.ii_derivation_origin === "undefined"
          ? undefined
          : config.ii_derivation_origin,
    };
    configCache = fullConfig;
    return fullConfig;
  } catch {
    const fallbackId = (() => {
      if (typeof window === "undefined") return undefined;
      const params = new URLSearchParams(window.location.search);
      const candidate = params.get("backendId") ?? params.get("id") ?? params.get("canisterId");
      const frontendCanisterId = getFrontendCanisterId();
      if (!candidate || candidate === frontendCanisterId) return undefined;
      return candidate;
    })();
    const finalCanisterId = backendCanisterId || backendCanisterIdFromQuery || fallbackId;
    if (!finalCanisterId) {
      console.warn("CANISTER_ID_BACKEND is not set during fallback path.");
    }
    const resolveLocalHost = () => {
      if (typeof window !== "undefined") {
        const hostName = window.location.hostname;
        const origin = window.location.origin;
        if (
          hostName.endsWith(".localhost") ||
          hostName === "localhost" ||
          hostName === "127.0.0.1"
        ) {
          return origin;
        }
      }
      return "http://127.0.0.1:8000";
    };

    const fallbackConfig = {
      backend_host: resolveLocalHost(),
      backend_canister_id: finalCanisterId ?? "",
      storage_gateway_url: DEFAULT_STORAGE_GATEWAY_URL,
      bucket_name: DEFAULT_BUCKET_NAME,
      project_id: DEFAULT_PROJECT_ID,
      ii_derivation_origin: undefined,
    };
    return fallbackConfig;
  }
}

function extractAgentErrorMessage(error: string): string {
  const errorString = String(error);
  const match = errorString.match(/with message:\s*'([^']+)'/s);
  return match ? match[1] : errorString;
}

function processError(e: unknown): never {
  if (e && typeof e === "object" && "message" in e) {
    throw new Error(extractAgentErrorMessage(`${e.message}`));
  }
  throw e;
}

async function maybeLoadMockBackend(): Promise<backendInterface | null> {
  if (import.meta.env.VITE_USE_MOCK !== "true") {
    return null;
  }

  try {
    // If VITE_USE_MOCK is enabled, try to load a mock backend module *if it exists*.
    // We use import.meta.glob so builds don't fail when the mock file is absent.
    const mockModules = import.meta.glob("./mocks/backend.{ts,tsx,js,jsx}");

    const path = Object.keys(mockModules)[0];
    if (!path) return null;

    const mod = (await mockModules[path]()) as {
      mockBackend?: backendInterface;
    };

    return mod.mockBackend ?? null;
  } catch {
    return null;
  }
}

export async function createActorWithConfig(
  options?: CreateActorOptions,
): Promise<backendInterface> {
  // Attempt to load mock backend if enabled
  const mock = await maybeLoadMockBackend();
  if (mock) {
    return mock;
  }

  const config = await loadConfig();
  console.debug("createActorWithConfig config:", config);
  if (!config.backend_canister_id) {
    throw new Error(
      "backend_canister_id is not set. Ensure env.json has backend_canister_id and/or VITE_CANISTER_ID_BACKEND is configured.",
    );
  }
  const resolvedOptions = options ?? {};
  const agent = new HttpAgent({
    ...resolvedOptions.agentOptions,
    host: config.backend_host || "http://127.0.0.1:8000",
  });
  if (
    config.backend_host &&
    (config.backend_host.includes("localhost") ||
      config.backend_host.includes("127.0.0.1"))
  ) {
    await agent.fetchRootKey().catch((err) => {
      console.warn(
        "Unable to fetch root key. Check to ensure that your local replica is running",
      );
      console.error(err);
    });
  }
  const actorOptions = {
    ...resolvedOptions,
    agent: agent,
    processError,
  };

  const storageClient = new StorageClient(
    config.bucket_name,
    config.storage_gateway_url,
    config.backend_canister_id,
    config.project_id,
    agent,
  );

  const MOTOKO_DEDUPLICATION_SENTINEL = "!caf!";

  const uploadFile = async (file: ExternalBlob): Promise<Uint8Array> => {
    const { hash } = await storageClient.putFile(
      await file.getBytes(),
      file.onProgress,
    );
    return new TextEncoder().encode(MOTOKO_DEDUPLICATION_SENTINEL + hash);
  };

  const downloadFile = async (bytes: Uint8Array): Promise<ExternalBlob> => {
    const hashWithPrefix = new TextDecoder().decode(new Uint8Array(bytes));
    const hash = hashWithPrefix.substring(MOTOKO_DEDUPLICATION_SENTINEL.length);
    const url = await storageClient.getDirectURL(hash);
    return ExternalBlob.fromURL(url);
  };

  return createActor(
    config.backend_canister_id,
    uploadFile,
    downloadFile,
    actorOptions,
  );
}

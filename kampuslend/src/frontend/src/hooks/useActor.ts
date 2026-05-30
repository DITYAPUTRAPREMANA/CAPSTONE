import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { Ed25519KeyIdentity } from "@dfinity/identity";
import type { backendInterface } from "../backend";
import { createActorWithConfig } from "../config";
import { getSecretParameter } from "../utils/urlParams";
import { useInternetIdentity } from "./useInternetIdentity";

const ACTOR_QUERY_KEY = "actor";

function getOrCreateSessionIdentity() {
  if (typeof window === "undefined") return undefined;
  const key = "sodalis_session_identity";
  const stored = localStorage.getItem(key);
  if (stored) {
    try {
      return Ed25519KeyIdentity.fromJSON(stored);
    } catch (e) {
      console.error("Failed to parse stored identity:", e);
    }
  }
  const newIdentity = Ed25519KeyIdentity.generate();
  localStorage.setItem(key, JSON.stringify(newIdentity.toJSON()));
  return newIdentity;
}

export function useActor() {
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  const activeIdentity = identity || getOrCreateSessionIdentity();

  const actorQuery = useQuery<backendInterface, Error>({
    queryKey: [ACTOR_QUERY_KEY, activeIdentity?.getPrincipal().toString()],
    queryFn: async () => {
      const actorOptions = activeIdentity
        ? {
          agentOptions: {
            identity: activeIdentity,
          },
        }
        : {};

      const actor = await createActorWithConfig(actorOptions);
      const adminToken = getSecretParameter("adminToken") || "";
      await actor._initializeAccessControlWithSecret(adminToken);
      return actor;
    },
    // Only refetch when identity changes
    staleTime: Number.POSITIVE_INFINITY,
    // This will cause the actor to be recreated when the identity changes
    enabled: true,
  });

  // When the actor changes, invalidate dependent queries
  useEffect(() => {
    if (actorQuery.data) {
      queryClient.invalidateQueries({
        predicate: (query) => {
          return !query.queryKey.includes(ACTOR_QUERY_KEY);
        },
      });
      queryClient.refetchQueries({
        predicate: (query) => {
          return !query.queryKey.includes(ACTOR_QUERY_KEY);
        },
      });
    }
  }, [actorQuery.data, queryClient]);

  return {
    actor: actorQuery.data || null,
    isFetching: actorQuery.isFetching,
    isError: actorQuery.isError,
    error: actorQuery.error,
  };
}


import { useCallback, useMemo, useState } from "react";
import Axios from "axios";

import { Nullable, SimpleHandler } from "@mo-id/typescript-toolbelt";
import { BaseSession } from "../../types";
import {
  authenticateClientRequests,
  interceptUnauthorizedResponses,
} from "../utils";

export interface UseAxiosInterceptors {
  setup: <Session extends BaseSession<User>, User>(
    session: Nullable<Session>,
    onUnauthorized: SimpleHandler
  ) => void;
  cleanup: SimpleHandler;
}

export function useAxiosInterceptors(): UseAxiosInterceptors {
  const [requestInterceptorId, setRequestInterceptorId] =
    useState<Nullable<number>>(null);
  const [responseInterceptorId, setResponseInterceptorId] =
    useState<Nullable<number>>(null);

  const setup = useCallback(
    <Session extends BaseSession<User>, User>(
      session: Nullable<Session>,
      onUnauthorized: SimpleHandler
    ) => {
      const { request, response } = Axios.interceptors;
      const handleAuthentication = authenticateClientRequests(session);
      const handleUnauthorized = interceptUnauthorizedResponses(onUnauthorized);

      setRequestInterceptorId(request.use(handleAuthentication));
      setResponseInterceptorId(response.use(...handleUnauthorized));
    },
    []
  );

  const cleanup = useCallback(() => {
    const { request, response } = Axios.interceptors;
    if (requestInterceptorId) request.eject(requestInterceptorId);
    if (responseInterceptorId) response.eject(responseInterceptorId);
  }, []);

  return useMemo(
    () => ({
      setup,
      cleanup,
    }),
    []
  );
}

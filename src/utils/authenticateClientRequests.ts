import { AxiosRequestConfig } from "axios";

import { Nullable } from "@mo-id/typescript-toolbelt";
import { BaseSession } from "./types";

export function authenticateClientRequests<
  Session extends BaseSession<User>,
  User
>(session: Nullable<Session>) {
  return function interceptor(request: AxiosRequestConfig) {
    if (session) {
      request.headers!["Authorization"] = `Bearer ${session.accessToken}`;
    }

    return request;
  };
}

import { Optional } from "@mo-id/typescript-toolbelt";
import { BaseSession } from "../../types";

export function createSession(
  overrides?: Optional<BaseSession<unknown>>
): BaseSession<unknown> {
  return {
    accessToken: "accessToken",
    expireAt: 9999,
    user: null,
    ...overrides,
  };
}

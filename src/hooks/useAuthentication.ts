import { useContext } from "react";
import {
  Anonymous,
  AuthenticationContext,
  AuthenticationState,
  IAuthenticationContext,
} from "../AuthenticationContext";
import { BaseSession } from "../utils";

export function useAuthentication<
  Session extends BaseSession<User>,
  User,
  AuthenticationStatus extends AuthenticationState = Anonymous
>() {
  return useContext<
    IAuthenticationContext<Session, User, AuthenticationStatus>
  >(
    AuthenticationContext as unknown as React.Context<
      IAuthenticationContext<Session, User, AuthenticationStatus>
    >
  );
}

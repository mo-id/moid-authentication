import { useContext } from "react";

import { BaseSession } from "../../types";
import {
  Anonymous,
  AuthenticationContext,
  AuthenticationState,
  IAuthenticationContext,
} from "../AuthenticationContext";

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

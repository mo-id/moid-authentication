import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { Nullable, Optional, SimpleHandler } from "@mo-id/typescript-toolbelt";
import { BaseSession, WithChildren } from "../types";
import { useAxiosInterceptors } from "./hooks";

interface IAuthenticationHandlers<Session extends BaseSession<User>, User> {
  signIn: (email: string, password: string) => Promise<Nullable<Session>>;
  logout: () => Promise<void>;
  signUp: (...args: any[]) => Promise<any>;
  forgotPassword: (...args: any[]) => Promise<any>;
  resetPassword: (...args: any[]) => Promise<any>;
}

export type Authenticated = true;
export type Anonymous = false;
export type AuthenticationState = Authenticated | Anonymous;
export type TypeFromAuthenticationStatus<
  AuthenticationStatus extends AuthenticationState,
  WhenAuthenticated,
  WhenAnonymous
> = AuthenticationStatus extends Authenticated
  ? WhenAuthenticated
  : WhenAnonymous;
export type OptionalWhenAnonymous<
  AuthenticationStatus extends AuthenticationState,
  Type
> = TypeFromAuthenticationStatus<AuthenticationStatus, Type, Optional<Type>>;

export interface IAuthenticationContext<
  Session extends BaseSession<User>,
  User,
  AuthenticationStatus extends AuthenticationState = Anonymous
> extends IAuthenticationHandlers<Session, User> {
  isAuthenticated: boolean;
  session: OptionalWhenAnonymous<AuthenticationStatus, Session>;
  currentUser: OptionalWhenAnonymous<AuthenticationStatus, User>;
}

const DEFAULT_CONTEXT_VALUE: IAuthenticationContext<BaseSession<any>, any> = {
  signIn: () => Promise.resolve(null),
  signUp: () => Promise.resolve(),
  forgotPassword: () => Promise.resolve(),
  resetPassword: () => Promise.resolve(),
  logout: () => Promise.resolve(),
  isAuthenticated: false,
  session: null,
  currentUser: null,
};

export const AuthenticationContext = createContext<
  IAuthenticationContext<BaseSession<any>, any, AuthenticationState>
>(DEFAULT_CONTEXT_VALUE);
export const AuthenticationContextProvider = AuthenticationContext.Provider;

export interface AuthenticationProviderProps<
  Session extends BaseSession<User>,
  User
> extends WithChildren,
    IAuthenticationHandlers<Session, User> {
  session: Nullable<Session>;
  onLogoutAfterUnauthorized?: SimpleHandler;
  onLogoutAfterExpiration?: SimpleHandler;
}

export function AuthenticationProvider<
  Session extends BaseSession<User>,
  User
>({
  session: savedSession,
  signIn: logIn,
  logout: signOut,
  signUp,
  forgotPassword,
  resetPassword,
  onLogoutAfterUnauthorized,
  onLogoutAfterExpiration,
  children,
}: AuthenticationProviderProps<Session, User>) {
  const [session, setSession] = useState<Nullable<Session>>(savedSession);
  const interceptors = useAxiosInterceptors();

  const signIn = useCallback(async (email: string, password: string) => {
    const session = await logIn(email, password);
    setSession(session);
    interceptors.setup(session, logoutAfterUnauthorized);
    return session;
  }, []);

  const logout = useCallback(async () => {
    await signOut();
    setSession(null);
    interceptors.cleanup();
  }, []);

  const logoutAfterUnauthorized = useCallback(async () => {
    await logout();
    onLogoutAfterUnauthorized?.();
  }, []);

  const logoutAfterExpiration = useCallback(async () => {
    await logout();
    onLogoutAfterExpiration?.();
  }, []);

  /**
   * Questo effetto effettua un logout allo scadere del token
   */
  useEffect(() => {
    if (session) {
      const now = new Date().getTime();
      const expireAt = session.expireAt * 1000;
      const msToExpiration = expireAt - now;

      const sessionExpirationTimeout = setTimeout(
        logoutAfterExpiration,
        msToExpiration
      );

      return () => clearTimeout(sessionExpirationTimeout);
    }

    return () => {};
  }, [session]);

  /**
   * Questo effetto predispone gli interceptors al mount se c'è una sessione.
   * Questa condizione si verifica quando viene effettuato un refresh con una
   * sessione valida che arriva come prop all'AuthenticationContext
   */
  useEffect(() => {
    if (session) {
      interceptors.setup(session, logoutAfterUnauthorized);
    }
  }, []);

  const value = useMemo(
    () => ({
      ...DEFAULT_CONTEXT_VALUE,
      signIn,
      logout,
      signUp,
      forgotPassword,
      resetPassword,
      isAuthenticated: Boolean(session),
      session,
      currentUser: session?.user,
    }),
    [session]
  );

  return (
    <AuthenticationContextProvider value={value}>
      {children}
    </AuthenticationContextProvider>
  );
}

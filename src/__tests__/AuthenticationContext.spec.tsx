import React from "react";
import { render, waitFor, act } from "@testing-library/react";

import { Nullable, SimpleHandler } from "@mo-id/typescript-toolbelt";
import {
  AuthenticationProvider,
  IAuthenticationContext,
} from "../AuthenticationContext";
import { useAuthentication } from "../hooks";
import { BaseSession } from "../utils";
import { createSession } from "../test-utils";

const mockInterceptors = {
  setup: jest.fn(),
  cleanup: jest.fn(),
};
jest.mock("../hooks/useAxiosInterceptors", () => ({
  useAxiosInterceptors: () => mockInterceptors,
}));

describe("contexts / AuthenticationContext", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  function renderComponent(session: Nullable<BaseSession<unknown>> = null) {
    let context: Nullable<
      IAuthenticationContext<BaseSession<unknown>, unknown>
    > = null;

    function getContext(): IAuthenticationContext<
      BaseSession<unknown>,
      unknown
    > {
      return context!;
    }

    function Wrapper() {
      context = useAuthentication();
      return null;
    }

    const signIn = jest.fn();
    const logout = jest.fn();
    const signUp = jest.fn();
    const forgotPassword = jest.fn();
    const resetPassword = jest.fn();
    const onLogoutAfterExpiration = jest.fn();
    const onLogoutAfterUnauthorized = jest.fn();

    return {
      signIn,
      logout,
      signUp,
      forgotPassword,
      resetPassword,
      onLogoutAfterExpiration,
      onLogoutAfterUnauthorized,
      getContext,
      ...render(
        <AuthenticationProvider
          session={session}
          signIn={signIn}
          logout={logout}
          signUp={signUp}
          forgotPassword={forgotPassword}
          resetPassword={resetPassword}
          onLogoutAfterExpiration={onLogoutAfterExpiration}
          onLogoutAfterUnauthorized={onLogoutAfterUnauthorized}
        >
          <Wrapper />
        </AuthenticationProvider>
      ),
    };
  }

  it("is authenticated when a valid session is provided from outside", () => {
    const session = createSession();
    const { getContext } = renderComponent(session);
    expect(getContext()).toMatchObject({ isAuthenticated: true });
  });

  it("setup axios interceptors when the session is provided from outside", async () => {
    const session = createSession();
    renderComponent(session);
    await waitFor(() => expect(mockInterceptors.setup).toHaveBeenCalled());
  });

  it("setup session after successfull authentication", async () => {
    const { getContext, signIn } = renderComponent();
    signIn.mockResolvedValue(createSession());

    expect(getContext().isAuthenticated).toBe(false);

    await act(async () => {
      await getContext().signIn("user@oc.com", "password");
    });

    expect(getContext().isAuthenticated).toBe(true);
    expect(mockInterceptors.setup).toHaveBeenCalled();
  });

  it("clear the session and calls the onLogoutAfterUnauthorized handler when an api hit a 401 unauthorized", async () => {
    jest.useFakeTimers();

    let onUnauthorized: SimpleHandler = () => {};
    mockInterceptors.setup.mockImplementation((_, onUnauthorizedHandler) => {
      onUnauthorized = onUnauthorizedHandler;
    });

    const { getContext, logout, onLogoutAfterUnauthorized } = renderComponent(
      createSession()
    );
    logout.mockResolvedValue(true);

    await waitFor(() => expect(mockInterceptors.setup).toHaveBeenCalled());

    expect(getContext()).toMatchObject({ isAuthenticated: true });

    act(() => {
      onUnauthorized();
    });

    await waitFor(() => expect(logout).toHaveBeenCalled());
    expect(getContext()).toMatchObject({ isAuthenticated: false });
    expect(mockInterceptors.cleanup).toHaveBeenCalled();
    expect(onLogoutAfterUnauthorized).toHaveBeenCalled();
  });

  it("clear the session and calls the onLogoutAfterExpiration handler when the session expires", async () => {
    jest.useFakeTimers();

    const { getContext, logout, onLogoutAfterExpiration } = renderComponent(
      createSession()
    );
    logout.mockResolvedValue(true);

    await waitFor(() => expect(mockInterceptors.setup).toHaveBeenCalled());

    expect(getContext()).toMatchObject({ isAuthenticated: true });

    jest.runAllTimers();

    await waitFor(() => expect(logout).toHaveBeenCalled());
    expect(getContext()).toMatchObject({ isAuthenticated: false });
    expect(mockInterceptors.cleanup).toHaveBeenCalled();
    expect(onLogoutAfterExpiration).toHaveBeenCalled();
  });
});

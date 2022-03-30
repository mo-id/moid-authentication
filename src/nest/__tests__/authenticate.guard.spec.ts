import { ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";

import { AuthenticateGuard } from "../authenticate.guard";

describe("iam", () => {
  describe("authentication", () => {
    describe("AuthenticateGuard", () => {
      const jwtGuard = AuthGuard("jwt");
      const isPublicEndpoint = jest.fn();
      const reflector = {
        getAllAndOverride: isPublicEndpoint,
      } as unknown as Reflector;
      const context = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
      } as unknown as ExecutionContext;

      it("returns true when endpoint is public", async () => {
        isPublicEndpoint.mockReturnValue(true);

        const guard = new AuthenticateGuard(reflector);

        expect(await guard.canActivate(context)).toBe(true);
      });

      it("returns false when endpoint is not public and there's no accessToken", async () => {
        isPublicEndpoint.mockReturnValue(false);
        jest.spyOn(jwtGuard.prototype, "canActivate").mockReturnValue(false);

        const guard = new AuthenticateGuard(reflector);

        expect(await guard.canActivate(context)).toBe(false);
      });

      it("returns true when there's an accessToken", async () => {
        isPublicEndpoint.mockReturnValue(false);
        jest.spyOn(jwtGuard.prototype, "canActivate").mockReturnValue(true);

        const guard = new AuthenticateGuard(reflector);

        expect(await guard.canActivate(context)).toBe(true);
      });
    });
  });
});

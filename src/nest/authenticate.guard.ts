import { ExecutionContext, Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Reflector } from "@nestjs/core";

import { IS_PUBLIC_ENDPOINT_KEY } from "./public.decorator";

@Injectable()
export class AuthenticateGuard extends AuthGuard("jwt") {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  public async canActivate(context: ExecutionContext) {
    const isPublicEndpoint = this.reflector.getAllAndOverride<boolean>(
      IS_PUBLIC_ENDPOINT_KEY,
      [context.getHandler(), context.getClass()]
    );
    let shouldProceed: boolean | Promise<boolean> = false;

    try {
      shouldProceed = await (super.canActivate(context) as Promise<boolean>);
    } catch (exception) {
      if (!isPublicEndpoint) throw exception;
    }

    return isPublicEndpoint || shouldProceed;
  }
}

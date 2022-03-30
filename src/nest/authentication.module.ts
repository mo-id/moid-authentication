import { DynamicModule, Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";

import { JwtStrategy } from "./jwt.strategy";

interface RegisterAuthenticationModule {
  secret: string;
  expiresIn: number;
}

@Module({})
export class AuthenticationModule {
  static register({
    secret,
    expiresIn,
  }: RegisterAuthenticationModule): DynamicModule {
    return {
      module: AuthenticationModule,
      imports: [
        PassportModule.register({ defaultStrategy: "jwt" }),
        JwtModule.register({
          secret,
          signOptions: {
            expiresIn,
          },
        }),
      ],
      providers: [JwtStrategy],
      exports: [JwtModule],
    };
  }
}

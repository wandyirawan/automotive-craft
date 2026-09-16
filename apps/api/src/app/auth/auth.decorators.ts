import {
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
} from "@nestjs/common";
import { FastifyRequest } from "fastify";
import { FastifySessionObject } from "@fastify/session";
export const IS_PUBLIC_KEY = "isPublic";
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

export const CurrentUser = createParamDecorator(
  (data: keyof FastifySessionObject | undefined, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest<FastifyRequest>();
    const session = req.session;
    return data ? session?.[data] : session;
  },
);

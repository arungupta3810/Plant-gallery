import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Like JwtAuthGuard but never throws — attaches req.user when a valid token is
// present, otherwise lets the request through as a guest.
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(_err: any, user: any) {
    return user || undefined;
  }
  canActivate(ctx: ExecutionContext) {
    return super.canActivate(ctx) as any;
  }
}

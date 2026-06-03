import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, AuthUser } from '../auth/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('wishlist')
export class WishlistController {
  constructor(private wishlist: WishlistService) {}

  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.wishlist.list(user.id);
  }

  @Post('toggle/:slug')
  toggle(@CurrentUser() user: AuthUser, @Param('slug') slug: string) {
    return this.wishlist.toggle(user.id, slug);
  }
}

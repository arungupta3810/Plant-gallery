import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, AuthUser } from '../auth/current-user.decorator';

@Controller('plants/:slug/reviews')
export class ReviewsController {
  constructor(private reviews: ReviewsService) {}

  @Get()
  list(@Param('slug') slug: string) {
    return this.reviews.forPlant(slug);
  }

  @UseGuards(JwtAuthGuard)
  @Get('eligibility')
  eligibility(@Param('slug') slug: string, @CurrentUser() user: AuthUser) {
    return this.reviews.eligibility(slug, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Param('slug') slug: string, @CurrentUser() user: AuthUser, @Body() dto: CreateReviewDto) {
    return this.reviews.create(slug, user.id, dto);
  }
}

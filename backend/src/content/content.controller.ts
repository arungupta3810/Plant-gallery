import { Controller, Get, Param } from '@nestjs/common';
import { ContentService } from './content.service';

@Controller()
export class ContentController {
  constructor(private content: ContentService) {}

  @Get('blog')
  blogList() {
    return this.content.blogList();
  }

  @Get('blog/:slug')
  blogOne(@Param('slug') slug: string) {
    return this.content.blogOne(slug);
  }

  @Get('faqs')
  faqs() {
    return this.content.faqs();
  }

  @Get('banners')
  banners() {
    return this.content.banners();
  }
}

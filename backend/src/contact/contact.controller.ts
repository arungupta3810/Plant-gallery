import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ContactService } from './contact.service';
import { CreateLeadDto } from './dto';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles, RolesGuard } from '../auth/roles.guard';
import { CurrentUser, AuthUser } from '../auth/current-user.decorator';

@Controller('contact')
export class ContactController {
  constructor(private contact: ContactService) {}

  @UseGuards(OptionalJwtAuthGuard)
  @Post()
  create(@Body() dto: CreateLeadDto, @CurrentUser() user?: AuthUser) {
    return this.contact.create(dto, user?.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @Get('leads')
  leads() {
    return this.contact.listAll();
  }
}

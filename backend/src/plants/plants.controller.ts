import {
  Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards,
} from '@nestjs/common';
import { PlantsService } from './plants.service';
import { PlantQueryDto, UpsertPlantDto } from './dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles, RolesGuard } from '../auth/roles.guard';

@Controller('plants')
export class PlantsController {
  constructor(private plants: PlantsService) {}

  @Get()
  findAll(@Query() query: PlantQueryDto) {
    return this.plants.findAll(query);
  }

  @Get('categories')
  categories() {
    return this.plants.categories();
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.plants.findOne(slug);
  }

  // ----- Admin CMS -----

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @Post()
  create(@Body() dto: UpsertPlantDto) {
    return this.plants.upsert(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @Put(':slug')
  update(@Param('slug') slug: string, @Body() dto: UpsertPlantDto) {
    return this.plants.upsert({ ...dto, slug });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':slug')
  remove(@Param('slug') slug: string) {
    return this.plants.remove(slug);
  }
}

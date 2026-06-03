import { Type } from 'class-transformer';
import {
  ArrayMinSize, IsArray, IsEmail, IsEnum, IsInt, IsOptional, IsString, Min, ValidateNested,
} from 'class-validator';
import { OrderStatus } from '@prisma/client';

export class OrderItemDto {
  @IsString()
  slug: string; // plant slug

  @IsInt() @Min(1)
  qty: number;
}

export class CreateOrderDto {
  @IsString() name: string;
  @IsEmail() email: string;
  @IsOptional() @IsString() phone?: string;
  @IsString() shipLine1: string;
  @IsOptional() @IsString() shipLine2?: string;
  @IsString() shipCity: string;
  @IsOptional() @IsString() shipState?: string;
  @IsString() shipZip: string;

  @IsOptional() @IsString() paymentMethod?: 'cod' | 'card';

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus)
  status: OrderStatus;
}

import {
  IsArray, IsBoolean, IsInt, IsOptional, IsString, Min,
} from 'class-validator';

export class PlantQueryDto {
  @IsOptional() @IsString()
  category?: string; // category name or "Pet-safe" or "All plants"

  @IsOptional() @IsString()
  q?: string; // free-text search

  @IsOptional() @IsString()
  light?: string; // comma-separated

  @IsOptional() @IsString()
  difficulty?: string; // comma-separated

  @IsOptional() @IsString()
  sort?: 'featured' | 'low' | 'high';
}

export class UpsertPlantDto {
  @IsOptional() @IsString() slug?: string;
  @IsString() name: string;
  @IsString() botanical: string;
  @IsOptional() @IsString() description?: string;
  @IsInt() @Min(0) price: number;
  @IsOptional() @IsInt() oldPrice?: number;
  @IsString() category: string; // category name
  @IsString() light: string;
  @IsString() water: string;
  @IsString() difficulty: string;
  @IsOptional() @IsBoolean() petSafe?: boolean;
  @IsOptional() @IsString() badge?: string;
  @IsOptional() @IsString() icon?: string;
  @IsOptional() @IsArray() theme?: [string, string];
  @IsOptional() @IsInt() @Min(0) stock?: number;
}

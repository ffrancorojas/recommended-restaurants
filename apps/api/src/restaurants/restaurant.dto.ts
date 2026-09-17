import { Transform, Type } from 'class-transformer';
import { ArrayMaxSize, ArrayUnique, IsArray, IsBoolean, IsIn, IsInt, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { PRICE_RANGE_VALUES, RESTAURANT_TYPES, RESTAURANT_RATING_VALUES } from '@restaurantes/contracts';
import type { RestaurantFormData, RestaurantType } from '@restaurantes/contracts';

const trim = ({ value }: { value: unknown }) => typeof value === 'string' ? value.trim() : value;

export class CreateRestaurantDto implements RestaurantFormData {
  @ApiProperty({ maxLength: 160 })
  @Transform(trim)
  @IsString()
  @MinLength(1)
  @MaxLength(160)
  name!: string;

  @ApiPropertyOptional({ default: '', maxLength: 160 })
  @Transform(trim)
  @IsString()
  @MaxLength(160)
  locality = '';

  @ApiPropertyOptional({ default: '', maxLength: 2000 })
  @Transform(trim)
  @IsString()
  @MaxLength(2000)
  dishes = '';

  @ApiPropertyOptional({ enum: PRICE_RANGE_VALUES, default: '' })
  @IsIn(PRICE_RANGE_VALUES)
  price: RestaurantFormData['price'] = '';

  @ApiPropertyOptional({ enum: RESTAURANT_TYPES, isArray: true, default: [] })
  @Transform(({ value }) => typeof value === 'string' ? (value ? [value] : []) : value)
  @IsArray()
  @ArrayUnique()
  @ArrayMaxSize(RESTAURANT_TYPES.length)
  @IsIn(RESTAURANT_TYPES, { each: true })
  type: RestaurantType[] = [];

  @ApiPropertyOptional({ default: '', maxLength: 4000 })
  @Transform(trim)
  @IsString()
  @MaxLength(4000)
  notes = '';

  @ApiPropertyOptional({ default: '', maxLength: 160 })
  @Transform(trim)
  @IsString()
  @MaxLength(160)
  recommendedBy = '';

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  visited = false;

  @ApiPropertyOptional({ default: '', maxLength: 4000 })
  @Transform(trim)
  @IsString()
  @MaxLength(4000)
  opinion = '';

  @ApiPropertyOptional({ enum: RESTAURANT_RATING_VALUES, default: '' })
  @IsIn(RESTAURANT_RATING_VALUES)
  rating: RestaurantFormData['rating'] = '';
}

// Elimina valores iniciales heredados: PATCH solo cambia los campos enviados.
export class UpdateRestaurantDto extends PartialType(CreateRestaurantDto, { skipNullProperties: false }) {
  constructor() {
    super();
    for (const key of Object.keys(this)) delete (this as Record<string, unknown>)[key];
  }
}

export class ListRestaurantsDto {
  @ApiPropertyOptional({ default: false, description: 'Mostrar solo restaurantes visitados' })
  @Transform(({ value }) => value === 'true' ? true : value === 'false' ? false : value)
  @IsBoolean()
  visitedOnly = false;

  @ApiPropertyOptional({ default: '', maxLength: 200 })
  @IsString()
  @MaxLength(200)
  query = '';

  @ApiPropertyOptional({ default: '', maxLength: 160 })
  @IsString()
  @MaxLength(160)
  locality = '';

  @ApiPropertyOptional({ enum: PRICE_RANGE_VALUES, default: '' })
  @IsIn(PRICE_RANGE_VALUES)
  price: RestaurantFormData['price'] = '';

  @ApiPropertyOptional({ isArray: true, enum: RESTAURANT_TYPES })
  @Transform(({ value }) => typeof value === 'string' ? [value] : value)
  @IsArray()
  @IsIn(RESTAURANT_TYPES, { each: true })
  types: RestaurantType[] = [];

  @ApiPropertyOptional({ default: 50, minimum: 1, maximum: 100 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 50;

  @ApiPropertyOptional({ default: 0, minimum: 0 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(1000000)
  offset = 0;
}

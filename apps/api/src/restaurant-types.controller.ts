import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RESTAURANT_TYPES } from '@restaurantes/contracts';

@ApiTags('restaurants')
@Controller('restaurant-types')
export class RestaurantTypesController {
  @Get()
  list() {
    return RESTAURANT_TYPES;
  }
}

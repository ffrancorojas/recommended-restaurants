import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { RestaurantIdPipe } from './restaurant-id.pipe';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard, AuthRequest } from '../auth/auth.guard';
import { CreateRestaurantDto, ListRestaurantsDto, UpdateRestaurantDto } from './restaurant.dto';
import { RestaurantsService } from './restaurants.service';

@ApiTags('restaurants')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('restaurants')
export class RestaurantsController {
  constructor(private readonly restaurants: RestaurantsService) {}

  @Get()
  list(@Req() req: AuthRequest, @Query() filters: ListRestaurantsDto) {
    return this.restaurants.list(req.user.id, filters);
  }

  @Post()
  create(@Req() req: AuthRequest, @Body() data: CreateRestaurantDto) {
    return this.restaurants.create(req.user.id, data);
  }

  @Get(':id')
  get(@Req() req: AuthRequest, @Param('id', RestaurantIdPipe) id: string) {
    return this.restaurants.get(req.user.id, id);
  }

  @Patch(':id')
  update(@Req() req: AuthRequest, @Param('id', RestaurantIdPipe) id: string, @Body() data: UpdateRestaurantDto) {
    return this.restaurants.update(req.user.id, id, data);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Req() req: AuthRequest, @Param('id', RestaurantIdPipe) id: string) {
    return this.restaurants.remove(req.user.id, id);
  }
}

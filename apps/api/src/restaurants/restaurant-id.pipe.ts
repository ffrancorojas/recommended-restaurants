import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class RestaurantIdPipe implements PipeTransform<string, string> {
  transform(value: string): string {
    if (!/^[1-9]\d{0,18}$/.test(value) || BigInt(value) > 9223372036854775807n) {
      throw new BadRequestException('El identificador debe ser un entero positivo válido.');
    }
    return value;
  }
}

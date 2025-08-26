import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Product Title' })
  title: string;
  @IsString()
  @IsOptional()
  @ApiProperty({ example: 'Product Description', required: false })
  description?: string;
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsNotEmpty()
  @ApiProperty({ example: 99.99 })
  price: number;
}

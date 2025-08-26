import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import argon from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async login(createAuthDto: CreateAuthDto) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email: createAuthDto.email },
      });
      if (!user) {
        throw new UnauthorizedException('Invalid Credentials');
      }
      const isMatch = await argon.verify(user.password, createAuthDto.password);
      if (!isMatch) {
        throw new UnauthorizedException('Invalid Credentials');
      }
      return await this.signToken(user.id, user.email);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException();
    }
  }

  async signup(createAuthDto: CreateAuthDto) {
    try {
      const hash = await argon.hash(createAuthDto.password);
      createAuthDto.password = hash;
      const user = await this.prisma.user.create({
        data: {
          email: createAuthDto.email,
          password: createAuthDto.password,
          name: createAuthDto.name,
        },
      });
      const { password, ...userWithoutPassword } = user;
      return { user: userWithoutPassword };
    } catch (error) {
      console.log(error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Credentials taken');
        }
      }
      throw new InternalServerErrorException();
    }
  }

  async signToken(userId: number, email: string) {
    const payload = {
      sub: userId,
      email,
    };
    const secret = this.config.get('JWT_SECRET');
    const token = await this.jwt.signAsync(payload, {
      expiresIn: '2h',
      secret: secret,
    });
    return { token };
  }
}

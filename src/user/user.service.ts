import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt'; // 🔥 Importando JWT Service
import { saveFile } from 'src/utils/file-utils';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService, // 🔥 Injetando JWT Service
  ) {}

  async getUsers(cpf?: string) {
    return this.prisma.user.findMany({
      where: cpf ? { cpf } : {},
      select: {
        id: true,
        name: true,
        cpf: true,
        email: true,
        phone: true,
        status: true,
        createdAt: true,
      },
    });
  }

  async getUserById(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        cpf: true,
        email: true,
        phone: true,
        status: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    return user;
  }

  async createUser(createUserDto: CreateUserDto, photo?: Express.Multer.File) {
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: createUserDto.email },
          { cpf: createUserDto.cpf },
          createUserDto.matricula
            ? { matricula: createUserDto.matricula }
            : undefined,
        ].filter(Boolean),
      },
    });

    if (existingUser) {
      throw new BadRequestException(
        'Já existe um usuário com esse CPF, matrícula ou e-mail.',
      );
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const photoPath = photo ? await saveFile(photo, 'photos') : null;

    const user = await this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
        photo: photoPath,
        status: false,
      },
    });

    // 🔥 Gerando Token JWT
    const token = this.jwtService.sign({ sub: user.id, email: user.email });

    return { ...user, token };
  }

  async updateUser(id: number, data: UpdateUserDto) {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }
}

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { saveFile } from 'src/utils/file-utils'; // 🔥 Importando utilitário para salvar arquivos

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * ====================================
   *  GET: Listar usuários
   * ====================================
   */
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

  /**
   * =========================================
   * GET: Buscar usuário por ID
   * =========================================
   */
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

  /**
   * =========================================
   * POST: Criar novo usuário com senha criptografada
   * =========================================
   */
  async createUser(createUserDto: CreateUserDto, photo?: Express.Multer.File) {
    // Verifica se já existe usuário com CPF, matrícula ou e-mail
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

    // Criptografa a senha antes de salvar
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Usa o utilitário para salvar a foto
    const photoPath = photo ? await saveFile(photo, 'photos') : null;

    // Cria o usuário
    const user = await this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
        photo: photoPath,
        status: false,
      },
    });

    return user;
  }

  /**
   * ====================================
   * PUT: Atualizar usuário
   * ====================================
   */
  async updateUser(id: number, data: UpdateUserDto) {
    const userExists = await this.prisma.user.findUnique({ where: { id } });

    if (!userExists) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    return this.prisma.user.update({
      where: { id },
      data,
    });
  }
}

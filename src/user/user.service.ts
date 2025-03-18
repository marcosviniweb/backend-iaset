import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { saveFile } from 'src/utils/file-utils';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) { }

  async getUsers(status?: boolean) {
    return this.prisma.user.findMany({
      where: status !== undefined ? { status } : {},
      select: {
        id: true,
        name: true,
        matricula: true,
        cpf: true,
        rg: true,
        vinculo: true,
        lotacao: true,
        endereco: true,
        email: true,
        phone: true,
        photo: true,
        birthDay: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async getUserById(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        matricula: true,
        cpf: true,
        rg: true,
        vinculo: true,
        lotacao: true,
        endereco: true,
        email: true,
        phone: true,
        photo: true,
        birthDay: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    return user;
  }

  async createUser(createUserDto: CreateUserDto, photo?: Express.Multer.File) {
    if (
      !createUserDto.name ||
      !createUserDto.cpf ||
      !createUserDto.email ||
      !createUserDto.password
    ) {
      throw new BadRequestException(
        'Os campos nome, cpf, email e senha são obrigatórios.',
      );
    }

    if (createUserDto.birthDay) {
      try {
        createUserDto.birthDay = new Date(createUserDto.birthDay).toISOString();
      } catch (error) {
        throw new BadRequestException(
          'Formato de data inválido. Use o formato ISO8601: YYYY-MM-DD.',
          error,
        );
      }
    }

    if (!createUserDto.birthDay) {
      throw new BadRequestException('O campo birthDay é obrigatório.');
    }

    try {
      createUserDto.birthDay = new Date(createUserDto.birthDay).toISOString();
    } catch (error) {
      throw new BadRequestException(
        'Formato de data inválido. Use o formato ISO8601: YYYY-MM-DD.',
      );
    }

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
      throw new ConflictException(
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
        birthDay: createUserDto.birthDay,
      },
    });

    const token = this.jwtService.sign({ sub: user.id, email: user.email });

    return { ...user, token };
  }

  async updateUser(
    id: number,
    data: UpdateUserDto,
    photo?: Express.Multer.File,
  ) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    // ✅ Convertendo birthDay para ISO8601 se vier preenchido
    if (data.birthDay) {
      try {
        data.birthDay = new Date(data.birthDay).toISOString();
      } catch (error) {
        throw new BadRequestException(
          'Formato de data inválido. Use o formato ISO8601 (YYYY-MM-DD ou YYYY-MM-DDTHH:mm:ssZ).',
        );
      }
    }

    let photoPath = user.photo;
    if (photo) {
      photoPath = await saveFile(photo, 'photos');
    }

    // ✅ Se a senha foi enviada, criptografa antes de salvar no banco
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }

    return this.prisma.user.update({
      where: { id },
      data: {
        ...data,
        photo: photoPath,
      },
    });
  }

  async changePassword(id: number, changePasswordDto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    // ✅ Verifica a senha antiga antes de alterar
    const isMatch = await bcrypt.compare(
      changePasswordDto.oldPassword,
      user.password,
    );
    if (!isMatch) {
      throw new BadRequestException('Senha antiga incorreta.');
    }

    // ✅ Evita re-hash caso a senha já tenha sido criptografada
    const isSamePassword = await bcrypt.compare(
      changePasswordDto.newPassword,
      user.password,
    );
    if (isSamePassword) {
      throw new BadRequestException(
        'A nova senha não pode ser igual à anterior.',
      );
    }

    const hashedPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);

    await this.prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });

    return { message: 'Senha alterada com sucesso.' };
  }
}

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
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

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
    if (!createUserDto.name || !createUserDto.cpf) {
      throw new BadRequestException('Os campos nome e cpf são obrigatórios.');
    }

    // Limpar campos opcionais vazios
    const cleanedDto = { ...createUserDto };
    // Converter todos os campos de string vazios para null
    Object.keys(cleanedDto).forEach((key) => {
      if (
        key !== 'name' &&
        key !== 'cpf' &&
        typeof cleanedDto[key] === 'string'
      ) {
        if (cleanedDto[key] === '') {
          cleanedDto[key] = null;
        }
      }
    });

    // Tratamento especial para birthDay
    if (cleanedDto.birthDay && cleanedDto.birthDay.trim() !== '') {
      try {
        // Valida o formato da data
        const dateObj = new Date(cleanedDto.birthDay);
        if (isNaN(dateObj.getTime())) {
          throw new Error('Data inválida');
        }
        // Atualiza para o formato ISO
        cleanedDto.birthDay = dateObj.toISOString();
      } catch (error) {
        throw new BadRequestException(
          'Formato de data inválido. Use o formato ISO8601: YYYY-MM-DD.',
        );
      }
    } else {
      // Se for string vazia ou null, define como null explicitamente
      cleanedDto.birthDay = null;
    }

    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          cleanedDto.email ? { email: cleanedDto.email } : undefined,
          { cpf: cleanedDto.cpf },
          cleanedDto.matricula
            ? { matricula: cleanedDto.matricula }
            : undefined,
        ].filter(Boolean),
      },
    });

    if (existingUser) {
      throw new ConflictException(
        'Já existe um usuário com esse CPF, matrícula ou e-mail.',
      );
    }

    // Criptografar senha apenas se ela for fornecida
    let hashedPassword = undefined;
    if (cleanedDto.password) {
      hashedPassword = await bcrypt.hash(cleanedDto.password, 10);
    }
    const photoPath = photo ? await saveFile(photo, 'photos') : null;

    const user = await this.prisma.user.create({
      data: {
        name: cleanedDto.name,
        matricula: cleanedDto.matricula,
        cpf: cleanedDto.cpf,
        rg: cleanedDto.rg,
        vinculo: cleanedDto.vinculo,
        lotacao: cleanedDto.lotacao,
        endereco: cleanedDto.endereco,
        email: cleanedDto.email,
        phone: cleanedDto.phone,
        password: hashedPassword,
        photo: photoPath,
        status: cleanedDto.status ?? false,
        firstAccess: cleanedDto.firstAccess ?? true,
        birthDay: cleanedDto.birthDay ? new Date(cleanedDto.birthDay) : null,
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

    // Limpar campos opcionais vazios
    const cleanedData = { ...data };
    // Converter todos os campos de string vazios para null
    Object.keys(cleanedData).forEach((key) => {
      if (typeof cleanedData[key] === 'string') {
        if (cleanedData[key] === '') {
          cleanedData[key] = null;
        }
      }
    });

    // Tratamento especial para birthDay
    if (
      cleanedData.birthDay &&
      cleanedData.birthDay.trim &&
      cleanedData.birthDay.trim() !== ''
    ) {
      try {
        cleanedData.birthDay = new Date(cleanedData.birthDay).toISOString();
      } catch (error) {
        throw new BadRequestException(
          'Formato de data inválido. Use o formato ISO8601 (YYYY-MM-DD ou YYYY-MM-DDTHH:mm:ssZ).',
        );
      }
    } else if (cleanedData.birthDay === '' || cleanedData.birthDay === null) {
      cleanedData.birthDay = null;
    }

    let photoPath = user.photo;
    if (photo) {
      photoPath = await saveFile(photo, 'photos');
    }

    // Se a senha foi enviada, criptografa antes de salvar no banco
    if (cleanedData.password) {
      cleanedData.password = await bcrypt.hash(cleanedData.password, 10);
    }

    return this.prisma.user.update({
      where: { id },
      data: {
        ...cleanedData,
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

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    // ✅ Gera um token seguro
    const resetToken = Math.random().toString(36).substr(2, 8);
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // Expira em 30 min

    // ✅ Atualiza o usuário no banco de dados com o token
    await this.prisma.user.update({
      where: { email: dto.email },
      data: {
        resetToken,
        resetTokenExpires: expiresAt,
      },
    });

    // ✅ Envia o e-mail com o link de recuperação
    await this.mailService.sendPasswordReset(dto.email, resetToken);

    return { message: 'E-mail de recuperação enviado com sucesso.' };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        resetToken: dto.token,
        resetTokenExpires: { gt: new Date() }, // Token válido
      },
    });

    if (!user) {
      throw new BadRequestException('Token inválido ou expirado.');
    }

    // ✅ Criptografa a nova senha
    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

    // ✅ Atualiza a senha e remove o token
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpires: null,
      },
    });

    return { message: 'Senha redefinida com sucesso.' };
  }

  async deleteUser(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }
    await this.prisma.user.delete({ where: { id } });
    return { message: 'Usuário excluído com sucesso.' };
  }
}

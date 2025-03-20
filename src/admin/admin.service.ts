import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.adminUser.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findOne(id: number) {
    const admin = await this.prisma.adminUser.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!admin) {
      throw new NotFoundException('Administrador não encontrado');
    }

    return admin;
  }

  async create(createAdminDto: CreateAdminDto) {
    try {
      // Verificar se o email já existe
      const existingAdmin = await this.prisma.adminUser.findUnique({
        where: { email: createAdminDto.email },
      });

      if (existingAdmin) {
        throw new ConflictException('Email já está em uso');
      }

      // Hash da senha
      const hashedPassword = await bcrypt.hash(createAdminDto.password, 10);

      // Criar novo admin
      const admin = await this.prisma.adminUser.create({
        data: {
          ...createAdminDto,
          password: hashedPassword,
        },
      });

      // Retornar admin sem a senha
      const { password, ...result } = admin;
      return result;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException('Não foi possível criar o administrador');
    }
  }

  async update(id: number, updateAdminDto: UpdateAdminDto) {
    const admin = await this.prisma.adminUser.findUnique({
      where: { id },
    });

    if (!admin) {
      throw new NotFoundException('Administrador não encontrado');
    }

    // Se estiver atualizando o email, verificar se já existe
    if (updateAdminDto.email && updateAdminDto.email !== admin.email) {
      const existingAdmin = await this.prisma.adminUser.findUnique({
        where: { email: updateAdminDto.email },
      });

      if (existingAdmin) {
        throw new ConflictException('Email já está em uso');
      }
    }

    // Se estiver atualizando a senha, fazer o hash
    if (updateAdminDto.password) {
      updateAdminDto.password = await bcrypt.hash(updateAdminDto.password, 10);
    }

    // Atualizar admin
    const updatedAdmin = await this.prisma.adminUser.update({
      where: { id },
      data: updateAdminDto,
    });

    // Retornar admin sem a senha
    const { password, ...result } = updatedAdmin;
    return result;
  }

  async remove(id: number) {
    const admin = await this.prisma.adminUser.findUnique({
      where: { id },
    });

    if (!admin) {
      throw new NotFoundException('Administrador não encontrado');
    }

    await this.prisma.adminUser.delete({
      where: { id },
    });

    return { message: 'Administrador removido com sucesso' };
  }

  async updateLoginTime(id: number) {
    return this.prisma.adminUser.update({
      where: { id },
      data: {
        lastLogin: new Date(),
      },
    });
  }
}

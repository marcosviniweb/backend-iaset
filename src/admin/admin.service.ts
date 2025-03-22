import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { AdminLoginDto } from './dto/admin-login.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

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

  async login(loginDto: AdminLoginDto) {
    // Buscar o admin pelo email
    const admin = await this.prisma.adminUser.findUnique({
      where: { email: loginDto.email },
    });

    // Verificar se o admin existe
    if (!admin) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // Verificar se o admin está ativo
    if (!admin.isActive) {
      throw new UnauthorizedException('Usuário está desativado');
    }

    // Verificar se a senha está correta
    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      admin.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // Atualizar a data do último login
    await this.updateLoginTime(admin.id);

    // Criar o token JWT
    const payload = {
      sub: admin.id,
      email: admin.email,
      role: admin.role,
      type: 'admin',
    };

    // Retornar os dados do admin (sem a senha) e o token
    const { password, ...result } = admin;

    return {
      admin: result,
      access_token: this.jwtService.sign(payload),
    };
  }
}

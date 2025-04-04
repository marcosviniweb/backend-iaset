import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateDependentDto } from './dto/create-dependent.dto';
import { UpdateDependentDto } from './dto/update-dependent.dto';
import { saveFile } from 'src/utils/file-utils'; // 🔥 Utilitário para salvar arquivos

@Injectable()
export class DependentsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * =========================================
   * POST: Criar Dependente
   * =========================================
   */
  async createDependent(
    userId: number,
    dependent: CreateDependentDto,
    file?: Express.Multer.File,
  ) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new BadRequestException('Usuário não encontrado.');
    }

    // Verifica se o CPF já existe para evitar duplicação
    if (dependent.cpf) {
      const existingDependent = await this.prisma.dependent.findUnique({
        where: { cpf: dependent.cpf },
      });

      if (existingDependent) {
        throw new BadRequestException(
          'CPF já cadastrado para outro dependente.',
        );
      }
    }

    // Salva o arquivo do dependente
    const filePath = file ? await saveFile(file, 'dependents') : null;

    // Criar dependente no banco
    const result = await this.prisma.dependent.create({
      data: {
        name: dependent.name,
        birthDate: new Date(dependent.birthDate),
        relationship: dependent.relationship,
        cpf: dependent.cpf,
        status: dependent.status === true ? true : false,
        userId: user.id,
        file: filePath,
      },
    });

    return result;
  }

  /**
   * ====================================
   *  GET: Listar Dependentes de um Usuário
   * ====================================
   */
  async getDependents(
    userId: number,
    statusFilter?: boolean,
    order: 'asc' | 'desc' = 'desc',
  ) {
    const whereClause: any = { userId };

    if (statusFilter !== undefined) {
      whereClause.status = statusFilter;
    }

    return this.prisma.dependent.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        birthDate: true,
        relationship: true,
        cpf: true,
        status: true,
        file: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            name: true,
            matricula: true,
          },
        },
      },
      orderBy: { createdAt: order },
    });
  }

  /**
   * ====================================
   *  GET: Buscar um Dependente Específico
   * ====================================
   */
  async getDependentById(userId: number, dependentId: number) {
    const dependent = await this.prisma.dependent.findFirst({
      where: {
        id: dependentId,
        userId,
      },
      select: {
        id: true,
        name: true,
        birthDate: true,
        relationship: true,
        cpf: true,
        status: true,
        file: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!dependent) {
      throw new NotFoundException('Dependente não encontrado.');
    }

    return dependent;
  }

  /**
   * ====================================
   *  PUT: Atualizar Dependente
   * ====================================
   */
  async updateDependent(
    dependentId: number,
    data: UpdateDependentDto,
    file?: Express.Multer.File,
  ) {
    // Se CPF foi passado, verificar se já existe para outro dependente
    if (data.cpf) {
      const existingDependent = await this.prisma.dependent.findFirst({
        where: { cpf: data.cpf, id: { not: dependentId } },
      });

      if (existingDependent) {
        throw new BadRequestException(
          'CPF já cadastrado para outro dependente.',
        );
      }
    }

    // Preparar os dados para atualização
    const updateData: any = {};

    // Atualizar apenas os campos que foram fornecidos
    if (data.name !== undefined) updateData.name = data.name;
    if (data.birthDate !== undefined)
      updateData.birthDate = new Date(data.birthDate);
    if (data.relationship !== undefined)
      updateData.relationship = data.relationship;
    if (data.cpf !== undefined) updateData.cpf = data.cpf;
    if (data.status !== undefined) updateData.status = data.status;

    // Se um novo arquivo foi enviado, salva e atualiza o caminho
    if (file) {
      const filePath = await saveFile(file, 'dependents');
      updateData.file = filePath;
    }

    return this.prisma.dependent.update({
      where: { id: dependentId },
      data: updateData,
      select: {
        id: true,
        name: true,
        birthDate: true,
        relationship: true,
        cpf: true,
        status: true,
        file: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  /**
   * ====================================
   *  DELETE: Remover Dependente
   * ====================================
   */
  async deleteDependent(userId: number, dependentId: number) {
    return this.prisma.dependent.delete({
      where: { id: dependentId, userId },
    });
  }

  /**
   * ====================================
   *  GET: Listar Todos os Dependentes do Sistema
   * ====================================
   */
  async getAllDependents(
    statusFilter?: boolean,
    order: 'asc' | 'desc' = 'desc',
  ) {
    const whereClause: any = {};

    if (statusFilter !== undefined) {
      whereClause.status = statusFilter;
    }

    return this.prisma.dependent.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        birthDate: true,
        relationship: true,
        cpf: true,
        status: true,
        file: true,
        userId: true,
        user: {
          select: {
            id: true,
            name: true,
            matricula: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: order },
    });
  }

  /**
   * ====================================
   *  PUT: Atualizar Apenas o Status de um Dependente
   * ====================================
   */
  async updateDependentStatus(dependentId: number, status: boolean) {
    // Verificar se o dependente existe
    const dependent = await this.prisma.dependent.findUnique({
      where: { id: dependentId },
    });

    if (!dependent) {
      throw new NotFoundException('Dependente não encontrado.');
    }

    // Atualizar apenas o status
    return this.prisma.dependent.update({
      where: { id: dependentId },
      data: { status },
      select: {
        id: true,
        name: true,
        status: true,
        userId: true,
      },
    });
  }
}

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
    files: Express.Multer.File[],
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

    // O status já deve ter sido convertido para boolean pelo controller
    console.log('Status no service (antes de criar):', dependent.status);

    // Salva os arquivos específicos do dependente
    const certidaoPath = files.find((file) =>
      file.fieldname.includes('certidaoNascimentoOuRGCPF'),
    )
      ? await saveFile(
          files.find((file) =>
            file.fieldname.includes('certidaoNascimentoOuRGCPF'),
          )!,
          'certidoes',
        )
      : null;

    const comprovanteCasamentoPath = files.find((file) =>
      file.fieldname.includes('comprovanteCasamentoOuUniao'),
    )
      ? await saveFile(
          files.find((file) =>
            file.fieldname.includes('comprovanteCasamentoOuUniao'),
          )!,
          'documentos',
        )
      : null;

    // Criar dependente no banco
    const result = await this.prisma.dependent.create({
      data: {
        name: dependent.name,
        birthDate: new Date(dependent.birthDate),
        relationship: dependent.relationship,
        cpf: dependent.cpf,
        status: dependent.status === true ? true : false,
        userId: user.id,
        certidaoNascimentoOuRGCPF: certidaoPath,
        comprovanteCasamentoOuUniao: comprovanteCasamentoPath,
      },
    });
    
    console.log('Dependente criado com status:', result.status);
    return result;
  }

  /**
   * ====================================
   *  GET: Listar Dependentes de um Usuário
   * ====================================
   */
  async getDependents(userId: number, statusFilter?: boolean) {
    const whereClause: any = { userId };
    
    // Se o filtro de status foi fornecido, adiciona à cláusula where
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
        certidaoNascimentoOuRGCPF: true,
        comprovanteCasamentoOuUniao: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' }, // Ordena por data de criação (mais recentes primeiro)
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
        certidaoNascimentoOuRGCPF: true,
        comprovanteCasamentoOuUniao: true,
        documentoAdocao: true,
        comprovanteMatriculaFaculdade: true,
        laudoMedicoFilhosDeficientes: true,
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
    userId: number,
    dependentId: number,
    data: UpdateDependentDto,
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

    // Tratar o status corretamente se for fornecido
    const updateData = { ...data };
    
    return this.prisma.dependent.update({
      where: { id: dependentId, userId },
      data: updateData,
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
  async getAllDependents(statusFilter?: boolean) {
    const whereClause: any = {};
    
    // Se o filtro de status foi fornecido, adiciona à cláusula where
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
        userId: true,
        user: {
          select: {
            id: true,
            name: true,
          }
        },
        certidaoNascimentoOuRGCPF: true,
        comprovanteCasamentoOuUniao: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
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

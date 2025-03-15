import {
    BadRequestException,
    Injectable,
    NotFoundException,
  } from '@nestjs/common';
  import { PrismaService } from 'src/prisma/prisma.service';
  import { CreateDependentDto } from './dto/create-dependent.dto';
  import { UpdateDependentDto } from './dto/update-dependent.dto';
  import { saveFile } from 'src/utils/file-utils'; // 🔥 Importando utilitário para salvar arquivos
  
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
      return this.prisma.dependent.create({
        data: {
          name: dependent.name,
          birthDate: new Date(dependent.birthDate),
          relationship: dependent.relationship,
          userId: user.id,
          certidaoNascimentoOuRGCPF: certidaoPath,
          comprovanteCasamentoOuUniao: comprovanteCasamentoPath,
        },
      });
    }
  
    /**
     * ====================================
     *  GET: Listar Dependentes de um Usuário
     * ====================================
     */
    async getDependents(userId: number) {
      return this.prisma.dependent.findMany({ where: { userId } });
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
      return this.prisma.dependent.update({
        where: { id: dependentId, userId },
        data,
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
  }
  
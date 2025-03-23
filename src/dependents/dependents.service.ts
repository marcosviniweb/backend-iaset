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
        status: dependent.status ?? false, // Usa o valor de status ou false como padrão
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
  async getDependents(userId: number) {
    return this.prisma.dependent.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        birthDate: true,
        relationship: true,
        cpf: true, // ✅ Adicionando CPF na resposta
        status: true, // ✅ Adicionando status na resposta
      },
    });
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
}

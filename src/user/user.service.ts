import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Obtém todos os usuários, podendo filtrar por CPF.
   * @param cpf - CPF do usuário para filtrar (opcional).
   * @returns Lista de usuários cadastrados.
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
   * Atualiza um usuário pelo ID.
   * @param id - ID do usuário.
   * @param data - Dados para atualização.
   * @returns Usuário atualizado.
   */
  async updateUser(id: number, data: any) {
    const userExists = await this.prisma.user.findUnique({ where: { id } });

    if (!userExists) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  /**
   * Atualiza um dependente apenas se ele pertence ao funcionário correto.
   * @param userId - ID do funcionário (usuário).
   * @param dependentId - ID do dependente.
   * @param data - Dados para atualização.
   * @returns Dependente atualizado se a relação for válida.
   */
  async updateDependent(userId: number, dependentId: number, data: any) {
    const dependent = await this.prisma.dependent.findFirst({
      where: { id: dependentId, userId }, // Verifica se o dependente pertence ao usuário
    });

    if (!dependent) {
      throw new NotFoundException(
        'Dependente não encontrado ou não pertence a este usuário.',
      );
    }

    // Impedir que o userId seja alterado (evita mover dependente para outro funcionário)
    if (data.userId) {
      throw new BadRequestException(
        'Não é permitido alterar o vínculo do dependente.',
      );
    }

    // Converte birthDate para um objeto Date se ele estiver presente
    if (data.birthDate) {
      data.birthDate = new Date(data.birthDate);
    }

    return this.prisma.dependent.update({
      where: { id: dependentId },
      data,
    });
  }
}

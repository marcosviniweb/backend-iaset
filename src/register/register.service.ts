import { Injectable, BadRequestException } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from '../auth/dto/register.dto';

@Injectable()
export class RegisterService extends AuthService {
  constructor(protected prisma: PrismaService) {
    super(prisma);
  }

  /**
   * Registra um novo usuário e seus dependentes.
   * @param data - Dados do usuário e seus dependentes.
   * @param files - Lista de arquivos enviados via AnyFilesInterceptor.
   * @returns Usuário criado com seus dependentes.
   */
  async register(data: RegisterDto, files: Express.Multer.File[]) {
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: data.email },
          { cpf: data.cpf },
          data.matricula ? { matricula: data.matricula } : undefined,
        ].filter(Boolean),
      },
    });

    if (existingUser) {
      throw new BadRequestException(
        'Já existe um usuário com esse CPF, matrícula ou e-mail.',
      );
    }

    // Criptografa a senha
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Processa a foto do funcionário
    const photoFile = files.find((file) => file.fieldname === 'photo');
    const photoPath = photoFile
      ? await this.saveFile(photoFile, 'photos')
      : null;

    // Cria o usuário com status inicial "não aprovado"
    const user = await this.prisma.user.create({
      data: {
        name: data.name,
        matricula: data.matricula,
        cpf: data.cpf,
        email: data.email,
        phone: data.phone,
        endereco: data.endereco,
        vinculo: data.vinculo,
        lotacao: data.lotacao,
        password: hashedPassword,
        photo: photoPath,
        status: false,
      },
    });

    if (
      !data.dependents ||
      !Array.isArray(data.dependents) ||
      data.dependents.length === 0
    ) {
      return user;
    }

    // Processa dependentes e seus documentos
    const dependentsData = await Promise.all(
      data.dependents.map(async (dep, index) => {
        const certidaoFile = files.find(
          (file) =>
            file.fieldname === `dependents_${index}_certidaoNascimentoOuRGCPF`,
        );
        const certidaoPath = certidaoFile
          ? await this.saveFile(certidaoFile, 'certidoes')
          : null;

        return {
          name: dep.name,
          birthDate: new Date(dep.birthDate),
          relationship: dep.relationship,
          userId: user.id,
          certidaoNascimentoOuRGCPF: certidaoPath,
        };
      }),
    );

    // Insere dependentes no banco
    await this.prisma.dependent.createMany({ data: dependentsData });

    const dependents = await this.prisma.dependent.findMany({
      where: { userId: user.id },
    });

    return { ...user, dependents };
  }
}

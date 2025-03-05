import { Injectable, BadRequestException } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';

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
        const dependentFiles = files.filter((file) =>
          file.fieldname.startsWith(`dependents_${index}_`),
        );

        const certidaoFile = dependentFiles.find((file) =>
          file.fieldname.includes('certidaoNascimentoOuRGCPF'),
        );
        const comprovanteCasamentoFile = dependentFiles.find((file) =>
          file.fieldname.includes('comprovanteCasamentoOuUniao'),
        );
        const documentoAdocaoFile = dependentFiles.find((file) =>
          file.fieldname.includes('documentoAdocao'),
        );
        const comprovanteFaculdadeFile = dependentFiles.find((file) =>
          file.fieldname.includes('comprovanteMatriculaFaculdade'),
        );
        const laudoMedicoFile = dependentFiles.find((file) =>
          file.fieldname.includes('laudoMedicoFilhosDeficientes'),
        );

        const certidaoPath = certidaoFile
          ? await this.saveFile(certidaoFile, 'certidoes')
          : null;
        const comprovanteCasamentoPath = comprovanteCasamentoFile
          ? await this.saveFile(comprovanteCasamentoFile, 'documentos')
          : null;
        const documentoAdocaoPath = documentoAdocaoFile
          ? await this.saveFile(documentoAdocaoFile, 'documentos')
          : null;
        const comprovanteFaculdadePath = comprovanteFaculdadeFile
          ? await this.saveFile(comprovanteFaculdadeFile, 'documentos')
          : null;
        const laudoMedicoPath = laudoMedicoFile
          ? await this.saveFile(laudoMedicoFile, 'documentos')
          : null;

        return {
          name: dep.name,
          birthDate: new Date(dep.birthDate),
          relationship: dep.relationship,
          userId: user.id,
          certidaoNascimentoOuRGCPF: certidaoPath,
          comprovanteCasamentoOuUniao: comprovanteCasamentoPath,
          documentoAdocao: documentoAdocaoPath,
          comprovanteMatriculaFaculdade: comprovanteFaculdadePath,
          laudoMedicoFilhosDeficientes: laudoMedicoPath,
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

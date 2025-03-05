import {
  Body,
  Controller,
  Post,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { RegisterService } from './register.service';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import {
  ApiTags,
  ApiConsumes,
  ApiBody,
  ApiResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';

@ApiTags('register')
@Controller('register')
export class RegisterController {
  constructor(private readonly registerService: RegisterService) {}

  /**
   * Registra um novo usuário com possíveis dependentes e arquivos.
   * @param body - Dados do usuário e seus dependentes.
   * @param files - Arquivos enviados (foto do usuário e documentos dos dependentes).
   * @returns Usuário cadastrado com seus dependentes.
   */
  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Dados do usuário e dependentes para cadastro.',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'João Silva' },
        matricula: { type: 'string', example: '123456' },
        cpf: { type: 'string', example: '123.456.789-00' },
        rg: { type: 'string', example: '12.345.678-9' },
        vinculo: { type: 'string', example: 'Servidor Público' },
        lotacao: { type: 'string', example: 'Secretaria de Saúde' },
        endereco: { type: 'string', example: 'Rua Exemplo, 123' },
        email: { type: 'string', example: 'joao@email.com' },
        phone: { type: 'string', example: '(11) 99999-9999' },
        password: { type: 'string', example: 'senha123' },
        photo: {
          type: 'string',
          format: 'binary',
          description: 'Foto do usuário',
        },
        dependents: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string', example: 'Maria Silva' },
              birthDate: {
                type: 'string',
                format: 'date',
                example: '2010-05-20',
              },
              relationship: { type: 'string', example: 'Filha' },
              certidaoNascimentoOuRGCPF: {
                type: 'string',
                format: 'binary',
                description: 'Certidão de nascimento ou RG/CPF do dependente',
              },
              comprovanteCasamentoOuUniao: {
                type: 'string',
                format: 'binary',
                description: 'Comprovante de casamento ou união estável',
              },
              documentoAdocao: {
                type: 'string',
                format: 'binary',
                description: 'Documento de adoção, se aplicável',
              },
              comprovanteMatriculaFaculdade: {
                type: 'string',
                format: 'binary',
                description:
                  'Comprovante de matrícula da faculdade, se aplicável',
              },
              laudoMedicoFilhosDeficientes: {
                type: 'string',
                format: 'binary',
                description: 'Laudo médico para filhos deficientes',
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Usuário cadastrado com sucesso.',
    schema: {
      example: {
        id: '1a2b3c4d',
        name: 'João Silva',
        cpf: '123.456.789-00',
        email: 'joao@email.com',
        status: false,
        dependents: [
          {
            id: '5e6f7g8h',
            name: 'Maria Silva',
            birthDate: '2010-05-20',
            relationship: 'Filha',
          },
        ],
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Erro ao cadastrar usuário.',
    schema: {
      example: {
        statusCode: 400,
        message: 'Já existe um usuário com esse CPF, matrícula ou e-mail.',
      },
    },
  })
  @UseInterceptors(
    AnyFilesInterceptor({
      storage: memoryStorage(),
    }),
  )
  async register(
    @Body() body: any,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const data = {
      ...body,
      dependents: body.dependents ? JSON.parse(body.dependents) : [],
    };

    return this.registerService.register(data, files);
  }
}

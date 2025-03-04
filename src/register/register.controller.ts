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
import { ApiTags, ApiConsumes, ApiBody } from '@nestjs/swagger';

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
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        matricula: { type: 'string' },
        cpf: { type: 'string' },
        rg: { type: 'string' },
        vinculo: { type: 'string' },
        lotacao: { type: 'string' },
        endereco: { type: 'string' },
        email: { type: 'string' },
        phone: { type: 'string' },
        password: { type: 'string' },
        photo: { type: 'string', format: 'binary' },
        dependents: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              birthDate: { type: 'string', format: 'date' },
              relationship: { type: 'string' },
            },
          },
        },
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
    // Converte dependents de string para JSON, caso exista
    const data = {
      ...body,
      dependents: body.dependents ? JSON.parse(body.dependents) : [],
    };

    return this.registerService.register(data, files);
  }
}

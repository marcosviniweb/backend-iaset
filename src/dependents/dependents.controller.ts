import {
  Controller,
  Post,
  Put,
  Get,
  Delete,
  Param,
  Body,
  UploadedFiles,
  UseInterceptors,
  BadRequestException,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

import { DependentsService } from './dependents.service';
import { CreateDependentDto } from './dto/create-dependent.dto';
import { UpdateDependentDto } from './dto/update-dependent.dto';

@ApiTags('dependents')
@Controller('users/:userId/dependents')
export class DependentsController {
  constructor(private readonly dependentsService: DependentsService) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(AnyFilesInterceptor({ storage: memoryStorage() }))
  @ApiOperation({ summary: 'Cadastrar um dependente de um usuário' })
  @ApiBody({
    description: 'Dados do dependente para cadastro.',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Maria Silva' },
        birthDate: { type: 'string', example: '2016-01-01' },
        relationship: { type: 'string', example: 'Filho' },
        cpf: { type: 'string', example: '123.456.789-00' },
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
          description: 'Comprovante de matrícula da faculdade, se aplicável',
        },
        laudoMedicoFilhosDeficientes: {
          type: 'string',
          format: 'binary',
          description: 'Laudo médico para filhos deficientes',
        },
      },
    },
  })
  async createDependent(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() body: CreateDependentDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    try {
      return await this.dependentsService.createDependent(userId, body, files);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Put(':dependentId')
  @ApiOperation({ summary: 'Atualizar um dependente' })
  async updateDependent(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('dependentId', ParseIntPipe) dependentId: number,
    @Body() data: UpdateDependentDto,
  ) {
    return this.dependentsService.updateDependent(userId, dependentId, data);
  }

  @Get()
  @ApiOperation({ summary: 'Listar dependentes de um usuário' })
  async getDependents(@Param('userId', ParseIntPipe) userId: number) {
    return this.dependentsService.getDependents(userId);
  }

  @Delete(':dependentId')
  @ApiOperation({ summary: 'Remover um dependente' })
  async deleteDependent(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('dependentId', ParseIntPipe) dependentId: number,
  ) {
    return this.dependentsService.deleteDependent(userId, dependentId);
  }
}

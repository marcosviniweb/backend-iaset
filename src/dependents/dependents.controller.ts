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
  Query,
  UploadedFile,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { AnyFilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

import { DependentsService } from './dependents.service';
import { CreateDependentDto } from './dto/create-dependent.dto';
import { UpdateDependentDto } from './dto/update-dependent.dto';

/**
 * DependentsController - Gerencia todos os dependentes do sistema
 * Permite listar e filtrar todos os dependentes independentemente do usuário
 */
@ApiTags('dependents')
@Controller('dependents')
export class DependentsController {
  constructor(private readonly dependentsService: DependentsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos os dependentes do sistema' })
  @ApiQuery({
    name: 'status',
    required: false,
    type: 'string',
    description:
      'Filtrar por status: "true" para aprovados, "false" para não aprovados',
  })
  @ApiQuery({
    name: 'order',
    required: false,
    type: 'string',
    description:
      'Ordenação por data de criação: "asc" para mais antigos primeiro, "desc" para mais novos primeiro',
  })
  async getAllDependents(
    @Query('status') status?: string,
    @Query('order') order: 'asc' | 'desc' = 'desc',
  ) {
    let statusFilter: boolean | undefined = undefined;

    if (status !== undefined) {
      if (status.toLowerCase() === 'true') {
        statusFilter = true;
      } else if (status.toLowerCase() === 'false') {
        statusFilter = false;
      }
    }

    return this.dependentsService.getAllDependents(statusFilter, order);
  }

  @Put(':dependentId')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  @ApiOperation({ summary: 'Atualizar um dependente' })
  @ApiBody({
    description: 'Dados do dependente para atualização',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'João da Silva Junior' },
        birthDate: { type: 'string', example: '2015-03-15' },
        relationship: { type: 'string', example: 'Filho(a)' },
        cpf: { type: 'string', example: '123.456.789-00' },
        status: { type: 'boolean', example: true },
        file: {
          type: 'string',
          format: 'binary',
          description:
            'Documento do dependente (RG, CPF, Certidão de Nascimento, etc)',
        },
      },
    },
  })
  async updateDependent(
    @Param('dependentId', ParseIntPipe) dependentId: number,
    @Body() data: UpdateDependentDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.dependentsService.updateDependent(dependentId, data, file);
  }

  @Put(':dependentId/status')
  @ApiOperation({ summary: 'Atualizar apenas o status de um dependente' })
  @ApiQuery({
    name: 'value',
    required: true,
    type: 'string',
    description:
      'Novo valor para o status: "true" para aprovado, "false" para não aprovado',
  })
  async updateDependentStatus(
    @Param('dependentId', ParseIntPipe) dependentId: number,
    @Query('value') value: string,
  ) {
    // Convertendo o valor da query para boolean
    let statusValue: boolean;

    if (value.toLowerCase() === 'true') {
      statusValue = true;
    } else {
      statusValue = false;
    }

    return this.dependentsService.updateDependentStatus(
      dependentId,
      statusValue,
    );
  }

  @Put(':dependentId/status=:value')
  @ApiOperation({
    summary: 'Atualizar o status de um dependente com URL simplificada',
  })
  async updateDependentStatusSimple(
    @Param('dependentId', ParseIntPipe) dependentId: number,
    @Param('value') value: string,
  ) {
    // Convertendo o valor do parâmetro para boolean
    let statusValue: boolean;

    if (value.toLowerCase() === 'true') {
      statusValue = true;
    } else {
      statusValue = false;
    }

    return this.dependentsService.updateDependentStatus(
      dependentId,
      statusValue,
    );
  }
}

/**
 * UserDependentsController - Gerencia os dependentes de um usuário específico
 * Permite criar, listar, atualizar e excluir dependentes de um usuário
 */
@ApiTags('user-dependents')
@Controller('users/:userId/dependents')
export class UserDependentsController {
  constructor(private readonly dependentsService: DependentsService) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  @ApiOperation({ summary: 'Cadastrar um dependente de um usuário' })
  @ApiQuery({
    name: 'status',
    required: false,
    type: 'string',
    description:
      'Use status=true na URL para FORÇAR status=false, ignorando o valor enviado no formulário',
  })
  @ApiBody({
    description: 'Dados do dependente para cadastro.',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Maria Silva' },
        birthDate: { type: 'string', example: '2016-01-01' },
        relationship: { type: 'string', example: 'Filho' },
        cpf: { type: 'string', example: '123.456.789-00' },
        status: {
          type: 'boolean',
          example: false,
          description: 'Status do dependente (aprovado ou não)',
        },
        file: {
          type: 'string',
          format: 'binary',
          description:
            'Documento do dependente (RG, CPF, Certidão de Nascimento, etc)',
        },
      },
    },
  })
  async createDependent(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() body: CreateDependentDto,
    @UploadedFile() file: Express.Multer.File,
    @Query('status') status?: string,
  ) {
    try {
      // Solução temporária: parâmetro de query para forçar status=false
      if (status === 'true') {
        body.status = false;
      }

      return await this.dependentsService.createDependent(userId, body, file);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Put(':dependentId')
  @ApiOperation({ summary: 'Atualizar um dependente' })
  @ApiQuery({
    name: 'status',
    required: false,
    type: 'string',
    description:
      'Use status=true na URL para FORÇAR status=false, ignorando o valor enviado no corpo da requisição',
  })
  async updateDependent(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('dependentId', ParseIntPipe) dependentId: number,
    @Body() data: UpdateDependentDto,
    @Query('status') status?: string,
  ) {
    // Solução temporária: parâmetro de query para forçar status=false
    if (status === 'true') {
      data.status = false;
    }

    return this.dependentsService.updateDependent(dependentId, data);
  }

  @Get()
  @ApiOperation({ summary: 'Listar dependentes de um usuário' })
  @ApiQuery({
    name: 'filterByStatus',
    required: false,
    type: 'string',
    description:
      'Filtrar por status: "true" para aprovados, "false" para não aprovados',
  })
  @ApiQuery({
    name: 'order',
    required: false,
    type: 'string',
    description:
      'Ordenação por data de criação: "asc" para mais antigos primeiro, "desc" para mais novos primeiro',
  })
  async getDependents(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('filterByStatus') filterByStatus?: string,
    @Query('order') order: 'asc' | 'desc' = 'desc',
  ) {
    let statusFilter: boolean | undefined = undefined;

    if (filterByStatus !== undefined) {
      if (filterByStatus.toLowerCase() === 'true') {
        statusFilter = true;
      } else if (filterByStatus.toLowerCase() === 'false') {
        statusFilter = false;
      }
    }

    return this.dependentsService.getDependents(userId, statusFilter, order);
  }

  @Get(':dependentId')
  @ApiOperation({ summary: 'Buscar um dependente específico' })
  async getDependentById(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('dependentId', ParseIntPipe) dependentId: number,
  ) {
    return this.dependentsService.getDependentById(userId, dependentId);
  }

  @Delete(':dependentId')
  @ApiOperation({ summary: 'Remover um dependente' })
  async deleteDependent(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('dependentId', ParseIntPipe) dependentId: number,
  ) {
    return this.dependentsService.deleteDependent(userId, dependentId);
  }

  @Put(':dependentId')
  @ApiOperation({ summary: 'Atualizar um dependente' })
  @ApiQuery({
    name: 'status',
    required: false,
    type: 'string',
    description:
      'Use status=true na URL para FORÇAR status=false, ignorando o valor enviado no corpo da requisição',
  })
  async updateDependentSimple(
    @Param('dependentId', ParseIntPipe) dependentId: number,
    @Body() data: UpdateDependentDto,
    @Query('status') status?: string,
  ) {
    // Solução temporária: parâmetro de query para forçar status=false
    if (status === 'true') {
      data.status = false;
    }

    return this.dependentsService.updateDependent(dependentId, data);
  }
}

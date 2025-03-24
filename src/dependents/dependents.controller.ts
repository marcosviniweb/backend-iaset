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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
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
    description: 'Filtrar por status: "true" para aprovados, "false" para não aprovados',
  })
  async getAllDependents(@Query('status') status?: string) {
    // Converter o parâmetro de string para boolean ou undefined
    let statusFilter: boolean | undefined = undefined;
    
    if (status !== undefined) {
      if (status.toLowerCase() === 'true') {
        statusFilter = true;
      } else if (status.toLowerCase() === 'false') {
        statusFilter = false;
      }
    }
    
    return this.dependentsService.getAllDependents(statusFilter);
  }

  @Put(':dependentId')
  @ApiOperation({ summary: 'Atualizar um dependente' })
  async updateDependent(
    @Param('dependentId', ParseIntPipe) dependentId: number,
    @Body() data: UpdateDependentDto,
  ) {
    return this.dependentsService.updateDependent(dependentId, data);
  }

  @Put(':dependentId/status')
  @ApiOperation({ summary: 'Atualizar apenas o status de um dependente' })
  @ApiQuery({
    name: 'value',
    required: true,
    type: 'string',
    description: 'Novo valor para o status: "true" para aprovado, "false" para não aprovado',
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
    
    return this.dependentsService.updateDependentStatus(dependentId, statusValue);
  }

  @Put(':dependentId/status=:value')
  @ApiOperation({ summary: 'Atualizar o status de um dependente com URL simplificada' })
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
    
    return this.dependentsService.updateDependentStatus(dependentId, statusValue);
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
  @UseInterceptors(AnyFilesInterceptor({ storage: memoryStorage() }))
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
    @Query('status') status?: string,
  ) {
    try {
      console.log('Body completo recebido:', JSON.stringify(body));
      
      // Solução temporária: parâmetro de query para forçar status=false
      if (status === 'true') {
        console.log('Forçando status para FALSE via query param');
        body.status = false;
      } 
      // Processamento normal apenas se o parâmetro de query não foi usado
      else if (body.status !== undefined) {
        console.log('Status tipo:', typeof body.status, 'Valor bruto:', body.status);
        
        // Para debug - mostra o valor exato recebido
        const asString = String(body.status).toLowerCase();
        console.log('Status como string:', asString);
        
        // Verificação rigorosa - se é "false" literal, converte para false booleano
        if (asString === 'false') {
          body.status = false;
        }
        // Se é "true" literal, converte para true booleano
        else if (asString === 'true') {
          body.status = true;
        }
        
        console.log('Status após conversão:', body.status);
      }

      return await this.dependentsService.createDependent(userId, body, files);
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
    console.log('Update - Body completo:', JSON.stringify(data));
    
    // Solução temporária: parâmetro de query para forçar status=false
    if (status === 'true') {
      console.log('Update - Forçando status para FALSE via query param');
      data.status = false;
    }
    // Processamento normal apenas se o parâmetro de query não foi usado
    else if (data.status !== undefined) {
      console.log('Update - Status tipo:', typeof data.status, 'Valor bruto:', data.status);
      
      // Para debug - mostra o valor exato recebido
      const asString = String(data.status).toLowerCase();
      console.log('Update - Status como string:', asString);
      
      // Verificação rigorosa - se é "false" literal, converte para false booleano
      if (asString === 'false') {
        data.status = false;
      }
      // Se é "true" literal, converte para true booleano
      else if (asString === 'true') {
        data.status = true;
      }
      
      console.log('Update - Status após conversão:', data.status);
    }

    return this.dependentsService.updateDependent(dependentId, data);
  }

  @Get()
  @ApiOperation({ summary: 'Listar dependentes de um usuário' })
  @ApiQuery({
    name: 'filterByStatus',
    required: false,
    type: 'string',
    description: 'Filtrar por status: "true" para aprovados, "false" para não aprovados',
  })
  async getDependents(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('filterByStatus') filterByStatus?: string,
  ) {
    // Converter o parâmetro de string para boolean ou undefined
    let statusFilter: boolean | undefined = undefined;
    
    if (filterByStatus !== undefined) {
      if (filterByStatus.toLowerCase() === 'true') {
        statusFilter = true;
      } else if (filterByStatus.toLowerCase() === 'false') {
        statusFilter = false;
      }
    }
    
    return this.dependentsService.getDependents(userId, statusFilter);
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
    console.log('Update - Body completo:', JSON.stringify(data));
    
    // Solução temporária: parâmetro de query para forçar status=false
    if (status === 'true') {
      console.log('Update - Forçando status para FALSE via query param');
      data.status = false;
    }
    // Processamento normal apenas se o parâmetro de query não foi usado
    else if (data.status !== undefined) {
      console.log('Update - Status tipo:', typeof data.status, 'Valor bruto:', data.status);
      
      // Para debug - mostra o valor exato recebido
      const asString = String(data.status).toLowerCase();
      console.log('Update - Status como string:', asString);
      
      // Verificação rigorosa - se é "false" literal, converte para false booleano
      if (asString === 'false') {
        data.status = false;
      }
      // Se é "true" literal, converte para true booleano
      else if (asString === 'true') {
        data.status = true;
      }
      
      console.log('Update - Status após conversão:', data.status);
    }

    return this.dependentsService.updateDependent(dependentId, data);
  }
}

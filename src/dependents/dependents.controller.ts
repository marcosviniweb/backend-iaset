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
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiQuery } from '@nestjs/swagger';
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
  @ApiQuery({
    name: 'forceStatusFalse',
    required: false,
    type: 'string',
    description: 'Se definido como "true", força o status do dependente para false, independente do valor enviado no form-data',
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
          description: 'Status do dependente (aprovado ou não)' 
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
    @Query('forceStatusFalse') forceStatusFalse?: string,
  ) {
    try {
      console.log('Body completo recebido:', JSON.stringify(body));
      console.log('Status tipo:', typeof body.status, 'Valor bruto:', body.status);
      
      // Solução temporária: parâmetro de query para forçar status=false
      if (forceStatusFalse === 'true') {
        console.log('Forçando status para FALSE via query param');
        body.status = false;
      }
      // Processamento normal
      else if (body.status !== undefined) {
        // Para debug - mostra o valor exato recebido
        const rawValue = body.status;
        const asString = String(body.status).toLowerCase();
        
        console.log('Status como string:', asString);
        console.log('É "false" string?', asString === 'false');
        console.log('É "true" string?', asString === 'true');
        
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
    name: 'forceStatusFalse',
    required: false,
    type: 'string',
    description: 'Se definido como "true", força o status do dependente para false, independente do valor enviado no body',
  })
  async updateDependent(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('dependentId', ParseIntPipe) dependentId: number,
    @Body() data: UpdateDependentDto,
    @Query('forceStatusFalse') forceStatusFalse?: string,
  ) {
    console.log('Update - Body completo:', JSON.stringify(data));
    console.log('Update - Status tipo:', typeof data.status, 'Valor bruto:', data.status);
    
    // Solução temporária: parâmetro de query para forçar status=false
    if (forceStatusFalse === 'true') {
      console.log('Update - Forçando status para FALSE via query param');
      data.status = false;
    }
    // Processamento normal
    else if (data.status !== undefined) {
      // Para debug - mostra o valor exato recebido
      const asString = String(data.status).toLowerCase();
      
      console.log('Update - Status como string:', asString);
      console.log('Update - É "false" string?', asString === 'false');
      console.log('Update - É "true" string?', asString === 'true');
      
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

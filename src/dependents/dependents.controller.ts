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

  /**
   * ========================
   *  POST: Criar Dependente
   * ========================
   */
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
        cpf: { type: 'string', example: '123.456.789-00' }, // ✅ Adicionando CPF no Swagger
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

  /**
   * ========================
   *  PUT: Atualizar Dependente
   * ========================
   */
  @Put(':dependentId')
  @ApiOperation({ summary: 'Atualizar um dependente' })
  async updateDependent(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('dependentId', ParseIntPipe) dependentId: number,
    @Body() data: UpdateDependentDto,
  ) {
    return this.dependentsService.updateDependent(userId, dependentId, data);
  }

  /**
   * ========================
   *  GET: Listar Dependentes de um Usuário
   * ========================
   */
  @Get()
  @ApiOperation({ summary: 'Listar dependentes de um usuário' })
  async getDependents(@Param('userId', ParseIntPipe) userId: number) {
    return this.dependentsService.getDependents(userId);
  }

  /**
   * ========================
   *  DELETE: Remover Dependente
   * ========================
   */
  @Delete(':dependentId')
  @ApiOperation({ summary: 'Remover um dependente' })
  async deleteDependent(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('dependentId', ParseIntPipe) dependentId: number,
  ) {
    return this.dependentsService.deleteDependent(userId, dependentId);
  }
}

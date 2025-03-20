import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';

@ApiTags('admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post()
  @ApiOperation({ summary: 'Criar um novo administrador' })
  @ApiBody({ type: CreateAdminDto })
  @ApiResponse({
    status: 201,
    description: 'Administrador criado com sucesso',
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos',
  })
  @ApiResponse({
    status: 409,
    description: 'Email já está em uso',
  })
  async create(@Body() createAdminDto: CreateAdminDto) {
    try {
      return await this.adminService.create(createAdminDto);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os administradores' })
  @ApiResponse({
    status: 200,
    description: 'Lista de administradores retornada com sucesso',
  })
  async findAll() {
    return this.adminService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar um administrador pelo ID' })
  @ApiParam({ name: 'id', required: true, description: 'ID do administrador' })
  @ApiResponse({
    status: 200,
    description: 'Administrador encontrado com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Administrador não encontrado',
  })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    try {
      return await this.adminService.findOne(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Erro ao buscar administrador');
    }
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar um administrador' })
  @ApiParam({ name: 'id', required: true, description: 'ID do administrador' })
  @ApiBody({ type: UpdateAdminDto })
  @ApiResponse({
    status: 200,
    description: 'Administrador atualizado com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Administrador não encontrado',
  })
  @ApiResponse({
    status: 409,
    description: 'Email já está em uso',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAdminDto: UpdateAdminDto,
  ) {
    try {
      return await this.adminService.update(id, updateAdminDto);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(error.message);
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover um administrador' })
  @ApiParam({ name: 'id', required: true, description: 'ID do administrador' })
  @ApiResponse({
    status: 200,
    description: 'Administrador removido com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Administrador não encontrado',
  })
  async remove(@Param('id', ParseIntPipe) id: number) {
    try {
      return await this.adminService.remove(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Erro ao remover administrador');
    }
  }
}

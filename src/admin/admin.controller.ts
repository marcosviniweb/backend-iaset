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
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { AdminLoginDto } from './dto/admin-login.dto';
import { AdminLoginResponseDto } from './dto/admin-login-response.dto';
import { AdminAuthGuard } from './guards/admin-auth.guard';

@ApiTags('admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard)
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
  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Listar todos os administradores' })
  @ApiResponse({
    status: 200,
    description: 'Lista de administradores retornada com sucesso',
  })
  async findAll() {
    return this.adminService.findAll();
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard)
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
  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard)
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
  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard)
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

  @Post('login')
  @ApiOperation({
    summary: 'Autenticar como administrador',
    description:
      'Realiza o login de um usuário administrador e retorna os dados do usuário junto com o token JWT',
  })
  @ApiBody({ type: AdminLoginDto })
  @ApiResponse({
    status: 200,
    description: 'Login realizado com sucesso',
    type: AdminLoginResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Credenciais inválidas ou usuário desativado',
  })
  async login(@Body() loginDto: AdminLoginDto) {
    try {
      return await this.adminService.login(loginDto);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new BadRequestException('Erro ao realizar login');
    }
  }
}

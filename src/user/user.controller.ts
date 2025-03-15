import {
  Controller,
  Get,
  Query,
  Put,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiQuery,
  ApiParam,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './user.service';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * ========================
   *  GET: Listar todos
   * ========================
   */
  @Get()
  @UseGuards(JwtAuthGuard) // 🔐 Agora protegido por autenticação
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar todos os usuários' })
  @ApiQuery({
    name: 'cpf',
    required: false,
    description: 'Filtrar por CPF (opcional)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuários retornada com sucesso',
  })
  async getUsers(@Query('cpf') cpf?: string) {
    return this.usersService.getUsers(cpf);
  }

  /**
   * ========================
   *  GET: Buscar por ID
   * ========================
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard) // 🔐 Agora protegido por autenticação
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Buscar um usuário pelo ID' })
  @ApiParam({ name: 'id', required: true, description: 'ID do usuário' })
  @ApiResponse({ status: 200, description: 'Usuário encontrado com sucesso' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async getUserById(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.getUserById(id);
  }

  /**
   * ========================
   *  POST: Criar usuário
   * ========================
   */
  @Post()
  @ApiOperation({ summary: 'Cadastrar um novo usuário' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('photo', { storage: memoryStorage() }))
  @ApiBody({
    description: 'Dados do usuário para cadastro.',
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
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Usuário cadastrado com sucesso.',
    schema: {
      example: {
        id: 1,
        name: 'João Silva',
        cpf: '123.456.789-00',
        email: 'joao@email.com',
        token: 'jwt_token_aqui',
      },
    },
  })
  async createUser(
    @Body() createUserDto: CreateUserDto,
    @UploadedFile() photo: Express.Multer.File,
  ) {
    try {
      return await this.usersService.createUser(createUserDto, photo);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  /**
   * ========================
   *  PUT: Atualizar usuário
   * ========================
   */
  @Put(':id')
  @ApiOperation({ summary: 'Atualizar um usuário' })
  @ApiParam({ name: 'id', required: true, description: 'ID do usuário' })
  @ApiResponse({ status: 200, description: 'Usuário atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateUserDto,
  ) {
    return this.usersService.updateUser(id, data);
  }
}

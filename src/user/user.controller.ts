import {
  Controller,
  Get,
  Query,
  Put,
  Param,
  Body,
  ParseIntPipe,
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
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './user.service';
import { ChangePasswordDto } from './dto/change-password.dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos os usuários' })
  @ApiQuery({
    name: 'status',
    required: false,
    description:
      'Filtrar por status (opcional, true para aprovados, false para não aprovados)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuários retornada com sucesso',
  })
  async getUsers(@Query('status') status?: string) {
    return this.usersService.getUsers(
      status !== undefined ? status === 'true' : undefined,
    );
  }

  @Put(':id/password')
  @ApiOperation({ summary: 'Alterar a senha do usuário' })
  @ApiParam({ name: 'id', required: true, description: 'ID do usuário' })
  @ApiBody({
    description: 'Dados necessários para alteração da senha',
    schema: {
      type: 'object',
      properties: {
        oldPassword: { type: 'string', example: 'senhaAntiga123' },
        newPassword: { type: 'string', example: 'novaSenhaSegura123' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Senha alterada com sucesso.' })
  @ApiResponse({
    status: 400,
    description: 'Senha antiga incorreta ou nova senha inválida.',
  })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado.' })
  async changePassword(
    @Param('id', ParseIntPipe) id: number,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.usersService.changePassword(id, changePasswordDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar um usuário pelo ID' })
  @ApiParam({ name: 'id', required: true, description: 'ID do usuário' })
  @ApiResponse({ status: 200, description: 'Usuário encontrado com sucesso' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async getUserById(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.getUserById(id);
  }

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
        birthDate: { type: 'string', format: 'date', example: '1990-01-01' },
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

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar um usuário' })
  @ApiParam({ name: 'id', required: true, description: 'ID do usuário' })
  @ApiResponse({ status: 200, description: 'Usuário atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('photo', { storage: memoryStorage() }))
  @ApiBody({
    description: 'Dados do usuário para atualização.',
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
        birthDate: { type: 'string', format: 'date', example: '1990-01-01' },
        photo: {
          type: 'string',
          format: 'binary',
          description: 'Foto do usuário',
        },
      },
    },
  })
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateUserDto,
    @UploadedFile() photo?: Express.Multer.File,
  ) {
    return this.usersService.updateUser(id, data, photo);
  }
}

import {
  Controller,
  Get,
  Query,
  Put,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import {
  ApiTags,
  ApiQuery,
  ApiParam,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateDependentDto } from './dto/update-dependent.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * Lista todos os usuários cadastrados, com filtro opcional por CPF.
   * @param cpf - CPF para filtrar usuários (opcional).
   * @returns Lista de usuários.
   */
  @Get()
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
    return this.userService.getUsers(cpf);
  }

  /**
   * Atualiza os dados de um usuário pelo ID.
   * @param id - ID do usuário.
   * @param data - Dados para atualização.
   * @returns Usuário atualizado.
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
    return this.userService.updateUser(id, data);
  }

  /**
   * Atualiza um dependente pelo ID, garantindo que ele pertence ao usuário.
   * @param userId - ID do funcionário.
   * @param dependentId - ID do dependente.
   * @param data - Dados para atualização.
   * @returns Dependente atualizado.
   */
  @Put(':userId/dependents/:dependentId')
  @ApiOperation({ summary: 'Atualizar um dependente' })
  @ApiParam({
    name: 'userId',
    required: true,
    description: 'ID do funcionário',
  })
  @ApiParam({
    name: 'dependentId',
    required: true,
    description: 'ID do dependente',
  })
  @ApiResponse({
    status: 200,
    description: 'Dependente atualizado com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Dependente não encontrado ou não pertence ao usuário',
  })
  async updateDependent(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('dependentId', ParseIntPipe) dependentId: number,
    @Body() data: UpdateDependentDto,
  ) {
    return this.userService.updateDependent(userId, dependentId, data);
  }
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Buscar um usuário pelo ID' })
  @ApiParam({ name: 'id', required: true, description: 'ID do usuário' })
  @ApiResponse({ status: 200, description: 'Usuário encontrado com sucesso' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async getUserById(@Param('id', ParseIntPipe) id: number) {
    return this.userService.getUserById(id);
  }
}

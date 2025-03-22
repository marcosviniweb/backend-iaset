import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

export const DeleteUserSwagger = {
  operation: ApiOperation({
    summary: 'Excluir um usuário',
    description: 'Exclui permanentemente um usuário do sistema pelo seu ID',
  }),
  
  param: ApiParam({
    name: 'id',
    type: 'number',
    description: 'ID do usuário a ser excluído',
    required: true,
  }),
  
  responses: {
    success: ApiResponse({
      status: 200,
      description: 'Usuário excluído com sucesso',
      schema: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            example: 'Usuário excluído com sucesso.',
          },
        },
      },
    }),
    
    notFound: ApiResponse({
      status: 404,
      description: 'Usuário não encontrado',
      schema: {
        type: 'object',
        properties: {
          statusCode: {
            type: 'number',
            example: 404,
          },
          message: {
            type: 'string',
            example: 'Usuário não encontrado.',
          },
          error: {
            type: 'string',
            example: 'Not Found',
          },
        },
      },
    }),
  },
}; 
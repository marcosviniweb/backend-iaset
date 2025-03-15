import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(protected prisma: PrismaService) {}

  /**
   * Gera um nome de arquivo com hash para evitar conflitos.
   * @param originalName - Nome original do arquivo.
   * @returns Nome do arquivo com hash.
   */
  protected generateHashedFilename(originalName: string): string {
    const hash = crypto
      .createHash('md5')
      .update(originalName + Date.now())
      .digest('hex');
    const ext = path.extname(originalName);
    return `${hash}${ext}`;
  }

  /**
   * Salva um arquivo no disco, verificando o tamanho máximo permitido.
   * @param file - Arquivo recebido pelo Multer.
   * @param folder - Pasta onde o arquivo será armazenado.
   * @returns O caminho do arquivo salvo ou null caso não haja arquivo.
   */
  protected async saveFile(
    file: Express.Multer.File,
    folder: string,
  ): Promise<string | null> {
    try {
      if (!file) {
        console.log('Nenhum arquivo foi enviado.');
        return null;
      }

      console.log('Arquivo recebido:', {
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
      });

      const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
      if (file.size > MAX_FILE_SIZE) {
        throw new BadRequestException(
          'O arquivo excede o tamanho máximo permitido de 2MB.',
        );
      }

      const rootPath = path.resolve(process.cwd(), 'uploads', folder);
      console.log('Pasta onde o arquivo será salvo:', rootPath);

      await fs.mkdir(rootPath, { recursive: true });

      const hashedFilename = this.generateHashedFilename(file.originalname);
      const filePath = path.join(rootPath, hashedFilename);

      await fs.writeFile(filePath, file.buffer);

      console.log(`Arquivo salvo em: ${filePath}`);

      return `/uploads/${folder}/${hashedFilename}`;
    } catch (error) {
      console.error('Erro ao salvar o arquivo:', error);
      throw new BadRequestException(
        error.message || 'Erro ao salvar o arquivo.',
      );
    }
  }
}

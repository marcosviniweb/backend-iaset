import { Module } from '@nestjs/common';
import { DependentsController } from './dependents.controller';
import { DependentsService } from './dependents.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [DependentsController],
  providers: [DependentsService, PrismaService],
  exports: [DependentsService],
})
export class DependentsModule {}

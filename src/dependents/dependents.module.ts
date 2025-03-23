import { Module } from '@nestjs/common';
import { DependentsController, UserDependentsController } from './dependents.controller';
import { DependentsService } from './dependents.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [DependentsController, UserDependentsController],
  providers: [DependentsService, PrismaService],
  exports: [DependentsService],
})
export class DependentsModule {}

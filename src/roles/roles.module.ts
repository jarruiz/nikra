import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { PermissionsService } from './permissions.service';
import { PermissionsController } from './permissions.controller';
import { UserRolesService } from './user-roles.service';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Role, Permission, User]),
  ],
  controllers: [RolesController, PermissionsController],
  providers: [RolesService, PermissionsService, UserRolesService],
  exports: [RolesService, PermissionsService, UserRolesService],
})
export class RolesModule {}


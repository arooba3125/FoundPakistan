import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { CasesService } from './cases.service';
import { CreateCaseDto, UpdateCaseDto } from './dto/case.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/user.entity';
import { CaseStatus } from './case.entity';

@Controller('cases')
export class CasesController {
  constructor(private readonly casesService: CasesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createCaseDto: CreateCaseDto, @Request() req) {
    return this.casesService.create(createCaseDto, req.user.id);
  }

  @Get()
  findAll(@Query('status') status?: CaseStatus, @Query('case_type') caseType?: string, @Query('city') city?: string) {
    return this.casesService.findAll({ status, case_type: caseType, city });
  }

  @Get('my-cases')
  @UseGuards(JwtAuthGuard)
  findMyCases(@Request() req) {
    return this.casesService.findByReporter(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.casesService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCaseDto: UpdateCaseDto,
    @Request() req,
  ) {
    return this.casesService.update(id, updateCaseDto, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id/verify')
  verifyCase(@Param('id') id: string, @Request() req) {
    return this.casesService.verifyCase(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id/reject')
  rejectCase(@Param('id') id: string, @Body('reason') reason: string, @Request() req) {
    return this.casesService.rejectCase(id, req.user.id, reason);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id/found')
  markAsFound(@Param('id') id: string, @Request() req) {
    return this.casesService.markAsFound(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.casesService.delete(id, req.user);
  }
}

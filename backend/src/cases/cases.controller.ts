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
import { MatchingService } from './matching.service';
import { CreateCaseDto, UpdateCaseDto } from './dto/case.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/user.entity';
import { CaseStatus } from './case.entity';

@Controller('cases')
export class CasesController {
  constructor(
    private readonly casesService: CasesService,
    private readonly matchingService: MatchingService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createCaseDto: CreateCaseDto, @Request() req) {
    return this.casesService.create(createCaseDto, req.user.id);
  }

  @Get()
  findAll(@Query('status') status?: CaseStatus, @Query('case_type') caseType?: string, @Query('city') city?: string) {
    return this.casesService.findAll({ status, case_type: caseType, city });
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-cases')
  findMyCases(@Request() req) {
    return this.casesService.findByReporter(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('contact-requests')
  getContactRequests(@Request() req) {
    return this.casesService.getContactRequestsForReporter(req.user.id);
  }

  // User Actions: Cancel and Mark Found (must come before generic :id routes)
  @UseGuards(JwtAuthGuard)
  @Patch(':id/cancel')
  cancelCase(@Param('id') id: string, @Request() req) {
    return this.casesService.cancelCase(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/mark-found-by-user')
  markAsFoundByUser(@Param('id') id: string, @Request() req) {
    return this.casesService.markAsFoundByUser(id, req.user.id);
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

  // DEPRECATED: Cases should only be marked as found through match confirmation
  // Keeping the method in service for potential edge cases, but not exposing via endpoint
  // Admin should use match confirmation to mark cases as found (matches 2 cases together)
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(UserRole.ADMIN)
  // @Patch(':id/found')
  // markAsFound(@Param('id') id: string, @Request() req) {
  //   return this.casesService.markAsFound(id, req.user.id);
  // }

  // Contact Request Endpoints (must come before generic :id route)
  @Post(':id/contact-request')
  async createContactRequest(
    @Param('id') id: string,
    @Body() body: { email: string; message?: string },
    @Request() req: any,
  ) {
    // This endpoint is public (no auth guard), but we can check if user is logged in
    const requesterId = req.user?.id || null;
    return this.casesService.createContactRequest(
      id,
      body.email,
      body.message,
      requesterId,
    );
  }

  // Generic routes (must come after specific routes)
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

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.casesService.delete(id, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('contact-requests/:id/approve')
  approveContactRequest(@Param('id') id: string, @Request() req) {
    return this.casesService.approveContactRequest(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('contact-requests/:id/reject')
  rejectContactRequest(@Param('id') id: string, @Request() req) {
    return this.casesService.rejectContactRequest(id, req.user.id);
  }

  // Matching Endpoints (Admin only)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('matches/potential')
  getPotentialMatches() {
    return this.matchingService.getPendingMatches();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('matches/:id/confirm')
  confirmMatch(@Param('id') id: string, @Request() req) {
    return this.matchingService.confirmMatch(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('matches/:id/reject')
  rejectMatch(@Param('id') id: string, @Request() req) {
    return this.matchingService.rejectMatch(id, req.user.id);
  }

}

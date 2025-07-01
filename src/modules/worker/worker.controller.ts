import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { CreateWorkerProfileDto } from './dtos/create-worker-profile.dto';
import { JwtUserAuthGuard } from '../auth/guards/jwt-user-auth.guard';
import { WorkerService } from './worker.service';

@ApiTags('Workers')
@Controller('api/workers')
export class WorkerController {
  constructor(private readonly workerService: WorkerService) {}

  @Post()
  @UseGuards(JwtUserAuthGuard)
  @ApiBearerAuth()
  async createWorkerProfile(@Request() req, @Body() dto: CreateWorkerProfileDto) {
    return this.workerService.createWorkerProfile(req.user.user, dto);
  }
}

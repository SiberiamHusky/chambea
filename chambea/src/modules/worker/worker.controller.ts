import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Body, Controller, Get, Param, Patch, Post, Request, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import { existsSync, mkdirSync } from 'fs';
import { CreateWorkerProfileDto } from './dtos/create-worker-profile.dto';
import { UpdateWorkerProfileDto } from './dtos/update-worker-profile.dto';
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
    // El guard de JWT adjunta el objeto User completo en req.user
    // Debemos pasar el identificador único del usuario (_id) al servicio
    return this.workerService.createWorkerProfile(req.user._id, dto);
  }

  @Post('me/cv')
  @UseGuards(JwtUserAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const userId = req.user?._id || 'unknown';
          const uploadDir = path.join(process.cwd(), 'uploads', 'cv', userId);
          if (!existsSync(uploadDir)) {
            mkdirSync(uploadDir, { recursive: true });
          }
          cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
          const timestamp = Date.now();
          const ext = path.extname(file.originalname).toLowerCase();
          cb(null, `cv_${timestamp}${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        const allowed = [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];
        if (allowed.includes(file.mimetype)) cb(null, true);
        else cb(new Error('Formato de archivo no permitido. Usa PDF, DOC o DOCX.'), false);
      },
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async uploadCv(@Request() req, @UploadedFile() file: any) {
    const userId = req.user._id;
    if (!file) {
      return { message: 'No se recibió archivo', url: null };
    }
    const relativeUrl = `/uploads/cv/${userId}/${file.filename}`;
    // Opcional: guardar directamente en el perfil si existe
    try {
      const profile = await this.workerService.findByUserId(userId);
      if (profile) {
        await this.workerService.updateMyProfile(userId, { cv_url: relativeUrl });
      }
    } catch (_) {
      // Si no existe perfil aún, se ignora. El cliente puede incluir cv_url en el createProfile.
    }
    return { message: 'CV subido correctamente', url: relativeUrl };
  }

  @Get('me')
  @UseGuards(JwtUserAuthGuard)
  @ApiBearerAuth()
  async getMyWorkerProfile(@Request() req) {
    return this.workerService.findByUserId(req.user._id);
  }

  @Patch('me')
  @UseGuards(JwtUserAuthGuard)
  @ApiBearerAuth()
  async updateMyWorkerProfile(@Request() req, @Body() dto: UpdateWorkerProfileDto) {
    return this.workerService.updateMyProfile(req.user._id, dto);
  }

  @Get('by-user/:id')
  @UseGuards(JwtUserAuthGuard)
  @ApiBearerAuth()
  async getWorkerByUserId(@Param('id') userId: string) {
    return this.workerService.findByUserId(userId);
  }
}

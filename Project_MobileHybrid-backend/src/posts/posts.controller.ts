import { Controller, Get, Post, Delete, Param, Body, Query, UseInterceptors, UploadedFile, UseGuards, HttpCode } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { PostsService } from './posts.service';
import { CreatePostDto, AddCommentDto } from './dto/post.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('posts')
export class PostsController {
  constructor(private postsService: PostsService) {}

  @Get('feed')
  @UseGuards(JwtAuthGuard)
  async getFeed(
    @CurrentUser() user: any,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('filter') filter?: string,
  ) {
    const MAX_LIMIT = 100;
    const validLimit = Math.min(Math.max(1, limit), MAX_LIMIT);
    const validPage = Math.max(1, page);
    const feedData = await this.postsService.getFeed(validPage, validLimit, user.id, filter);
    return {
      success: true,
      data: feedData,
    };
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: process.env.VERCEL ? '/tmp' : './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async createPost(
    @CurrentUser() user: any,
    @Body() createPostDto: CreatePostDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file) {
      const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
      const host =
        process.env.FILE_UPLOAD_HOST ||
        (process.env.NODE_ENV === 'production' ? 'go-fit-project.vercel.app' : 'localhost:3000');
      createPostDto.imageUrl = `${protocol}://${host}/uploads/${file.filename}`;
    }
    const post = await this.postsService.createPost(user.id, createPostDto);
    return {
      success: true,
      message: 'Post created successfully',
      data: post,
    };
  }

  @Get(':id')
  async getPostById(@Param('id') id: string) {
    const post = await this.postsService.getPostById(id);
    return {
      success: true,
      data: post,
    };
  }

  @Post(':id/like')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  async likePost(@CurrentUser() user: any, @Param('id') postId: string) {
    const post = await this.postsService.likePost(postId, user.id);
    return {
      success: true,
      data: post,
    };
  }

  @Post(':id/unlike')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  async unlikePost(@CurrentUser() user: any, @Param('id') postId: string) {
    const post = await this.postsService.unlikePost(postId, user.id);
    return {
      success: true,
      data: post,
    };
  }

  @Post(':id/save')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  async savePost(@CurrentUser() user: any, @Param('id') postId: string) {
    const post = await this.postsService.savePost(postId, user.id);
    return {
      success: true,
      data: post,
    };
  }

  @Post(':id/unsave')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  async unsavePost(@CurrentUser() user: any, @Param('id') postId: string) {
    const post = await this.postsService.unsavePost(postId, user.id);
    return {
      success: true,
      data: post,
    };
  }

  @Post(':id/comments')
  @UseGuards(JwtAuthGuard)
  async addComment(
    @CurrentUser() user: any,
    @Param('id') postId: string,
    @Body() commentDto: AddCommentDto,
  ) {
    const comment = await this.postsService.addComment(postId, user.id, commentDto.content);
    return {
      success: true,
      data: comment,
    };
  }

  @Get(':id/comments')
  async getPostComments(@Param('id') postId: string) {
    const comments = await this.postsService.getPostComments(postId);
    return {
      success: true,
      data: comments,
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deletePost(@CurrentUser() user: any, @Param('id') id: string) {
    await this.postsService.deletePost(id, user.id);
    return {
      success: true,
      message: 'Post deleted successfully',
    };
  }

  @Delete(':id/comments/:commentId')
  @UseGuards(JwtAuthGuard)
  async deleteComment(@CurrentUser() user: any, @Param('commentId') commentId: string) {
    await this.postsService.deleteComment(commentId, user.id);
    return {
      success: true,
      message: 'Comment deleted successfully',
    };
  }
}
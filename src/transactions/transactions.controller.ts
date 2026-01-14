import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  HttpCode,
  HttpStatus,
  Req,
} from "@nestjs/common";
import { Request } from "express";
import { TransactionsService } from "./transactions.service";
import { CreateTransactionDto } from "./dto/create-transaction.dto";
import { UpdateTransactionDto } from "./dto/update-transaction.dto";
import { QueryTransactionsDto } from "./dto/query-transactions.dto";
import { SupabaseAuthGuard } from "../auth/guards/supabase-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";

@Controller("transactions")
@UseGuards(SupabaseAuthGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  private getTokenFromRequest(req: Request): string {
    const authHeader = req.headers.authorization;
    return authHeader?.replace("Bearer ", "") || "";
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createTransactionDto: CreateTransactionDto,
    @CurrentUser() user: any,
    @Req() req: Request,
  ) {
    const token = this.getTokenFromRequest(req);
    return this.transactionsService.create(
      createTransactionDto,
      user.id,
      token,
    );
  }

  @Get()
  async findAll(
    @Query() query: QueryTransactionsDto,
    @CurrentUser() user: any,
    @Req() req: Request,
  ) {
    const token = this.getTokenFromRequest(req);
    return this.transactionsService.findAll(token, query);
  }

  @Get("summary")
  async getSummary(
    @Query("period") period: "week" | "month" | "bimester" | "semester",
    @CurrentUser() user: any,
    @Req() req: Request,
  ) {
    const token = this.getTokenFromRequest(req);
    return this.transactionsService.getSummary(user.id, token, period);
  }

  @Get(":id")
  async findOne(
    @Param("id") id: string,
    @CurrentUser() user: any,
    @Req() req: Request,
  ) {
    const token = this.getTokenFromRequest(req);
    return this.transactionsService.findOne(id, token);
  }

  @Patch(":id")
  async update(
    @Param("id") id: string,
    @Body() updateTransactionDto: UpdateTransactionDto,
    @CurrentUser() user: any,
    @Req() req: Request,
  ) {
    const token = this.getTokenFromRequest(req);
    return this.transactionsService.update(
      id,
      updateTransactionDto,
      user.id,
      token,
    );
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param("id") id: string,
    @CurrentUser() user: any,
    @Req() req: Request,
  ) {
    const token = this.getTokenFromRequest(req);
    return this.transactionsService.remove(id, user.id, token);
  }
}

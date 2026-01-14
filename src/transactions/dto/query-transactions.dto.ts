import { IsOptional, IsEnum, IsInt, Min, IsDateString } from "class-validator";
import { Type } from "class-transformer";
import { TransactionType } from "./create-transaction.dto";

export enum PeriodType {
  WEEK = "week",
  MONTH = "month",
  BIMESTER = "bimester",
  SEMESTER = "semester",
}

export class QueryTransactionsDto {
  @IsOptional()
  @IsEnum(TransactionType)
  type?: TransactionType;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @IsEnum(["created_at", "date", "amount"])
  orderBy?: string = "created_at";

  @IsOptional()
  @IsEnum(["asc", "desc"])
  order?: string = "desc";
}

import {
  IsString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsDateString,
  MinLength,
  Min,
} from "class-validator";

export enum TransactionType {
  INCOME = "income",
  OUTCOME = "outcome",
}

export class CreateTransactionDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsString()
  @MinLength(1)
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(TransactionType)
  type: TransactionType;

  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsDateString()
  @IsOptional()
  date?: string;
}

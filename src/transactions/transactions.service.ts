import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from "@nestjs/common";
import { SupabaseService } from "../supabase/supabase.service";
import { CreateTransactionDto } from "./dto/create-transaction.dto";
import { UpdateTransactionDto } from "./dto/update-transaction.dto";
import { QueryTransactionsDto } from "./dto/query-transactions.dto";
import { v4 as uuidv4 } from "uuid";

@Injectable()
export class TransactionsService {
  constructor(private supabaseService: SupabaseService) {}

  async create(
    createTransactionDto: CreateTransactionDto,
    userId: string,
    accessToken: string,
  ) {
    const supabase = this.supabaseService.getClientWithAuth(accessToken);

    const transactionData = {
      id: uuidv4(),
      name: createTransactionDto.name,
      title: createTransactionDto.title,
      description: createTransactionDto.description || null,
      type: createTransactionDto.type,
      amount: createTransactionDto.amount,
      date: createTransactionDto.date
        ? new Date(createTransactionDto.date).toISOString()
        : new Date().toISOString(),
      user_id: userId,
      created_at: new Date().toISOString(),
      updated_at: null,
    };

    const { data, error } = await supabase
      .from("transactions")
      .insert(transactionData)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(
        `Falha ao criar a transação: ${error.message}`,
      );
    }

    return data;
  }

  async findAll(accessToken: string, query: QueryTransactionsDto) {
    const supabase = this.supabaseService.getClientWithAuth(accessToken);

    let queryBuilder = supabase
      .from("transactions")
      .select("*", { count: "exact" });

    // Filtros
    if (query.type) {
      queryBuilder = queryBuilder.eq("type", query.type);
    }

    if (query.startDate) {
      queryBuilder = queryBuilder.gte("date", query.startDate);
    }

    if (query.endDate) {
      queryBuilder = queryBuilder.lte("date", query.endDate);
    }

    // Ordenação
    const orderBy = query.orderBy || "created_at";
    const order = query.order || "desc";
    queryBuilder = queryBuilder.order(orderBy, { ascending: order === "asc" });

    // Paginação
    const page = query.page || 1;
    const limit = query.limit || 10;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    queryBuilder = queryBuilder.range(from, to);

    const { data, error, count } = await queryBuilder;

    if (error) {
      throw new InternalServerErrorException(
        `Falha ao buscar transações: ${error.message}`,
      );
    }

    return {
      data,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  async findOne(id: string, accessToken: string) {
    const supabase = this.supabaseService.getClientWithAuth(accessToken);

    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        throw new NotFoundException("Transação não encontrada");
      }
      throw new InternalServerErrorException(
        `Falha ao obter a transação: ${error.message}`,
      );
    }

    return data;
  }

  private async verifyTransactionOwnership(
    id: string,
    userId: string,
    accessToken: string,
  ): Promise<void> {
    const supabase = this.supabaseService.getClientWithAuth(accessToken);

    const { data, error } = await supabase
      .from("transactions")
      .select("id")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        throw new NotFoundException("Transação não encontrada");
      }
      throw new InternalServerErrorException(
        `Falha ao verificar a propriedade da transação: ${error.message}`,
      );
    }

    if (!data) {
      throw new NotFoundException("Transação não encontrada");
    }
  }

  async update(
    id: string,
    updateTransactionDto: UpdateTransactionDto,
    userId: string,
    accessToken: string,
  ) {
    const supabase = this.supabaseService.getClientWithAuth(accessToken);

    // Verificar se a transação existe e pertence ao usuário
    await this.verifyTransactionOwnership(id, userId, accessToken);

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (updateTransactionDto.name !== undefined) {
      updateData.name = updateTransactionDto.name;
    }
    if (updateTransactionDto.title !== undefined) {
      updateData.title = updateTransactionDto.title;
    }
    if (updateTransactionDto.description !== undefined) {
      updateData.description = updateTransactionDto.description;
    }
    if (updateTransactionDto.type !== undefined) {
      updateData.type = updateTransactionDto.type;
    }
    if (updateTransactionDto.amount !== undefined) {
      updateData.amount = updateTransactionDto.amount;
    }
    if (updateTransactionDto.date !== undefined) {
      updateData.date = new Date(updateTransactionDto.date).toISOString();
    }

    const { data, error } = await supabase
      .from("transactions")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(
        `Falha ao atualizar a transação: ${error.message}`,
      );
    }

    return data;
  }

  async remove(id: string, userId: string, accessToken: string) {
    const supabase = this.supabaseService.getClientWithAuth(accessToken);

    // Verificar se a transação existe e pertence ao usuário
    await this.verifyTransactionOwnership(id, userId, accessToken);

    const { error } = await supabase
      .from("transactions")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      throw new InternalServerErrorException(
        `Falha ao excluir a transação: ${error.message}`,
      );
    }

    return { message: "Transação excluída com sucesso" };
  }

  async getSummary(
    userId: string,
    accessToken: string,
    period?: "week" | "month" | "bimester" | "semester",
  ) {
    const supabase = this.supabaseService.getClientWithAuth(accessToken);

    let startDate: Date;
    const endDate = new Date();

    switch (period) {
      case "week":
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        break;
      case "month":
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case "bimester":
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 2);
        break;
      case "semester":
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 6);
        break;
      default:
        // Sem período específico, retorna todos os dados
        startDate = new Date(0);
    }

    let queryBuilder = supabase.from("transactions").select("type, amount");

    if (period) {
      queryBuilder = queryBuilder.gte("date", startDate.toISOString());
    }

    const { data, error } = await queryBuilder;

    if (error) {
      throw new InternalServerErrorException(
        `Falha ao obter o resumo: ${error.message}`,
      );
    }

    const income = data
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const outcome = data
      .filter((t) => t.type === "outcome")
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const balance = income - outcome;

    return {
      period: period || "all",
      income,
      outcome,
      balance,
      totalTransactions: data.length,
    };
  }
}

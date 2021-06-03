import { getCustomRepository } from "typeorm";
import AppError from '../errors/AppError';
import Transaction from "../models/Transaction";
import TransactionsRepository from '../repositories/TransactionsRepository';

class DeleteTransactionService {
  public async execute(id: string): Promise<void> {
    const transactionRepository = getCustomRepository(TransactionsRepository);
    
    const transaction = await transactionRepository.findOne({ where: { id } });

    if (!transaction){
      throw new AppError('Transação não encontrada.', 401);
    }

    await transactionRepository
    .createQueryBuilder()
    .delete()
    .from(Transaction)
    .where("id = :id", { id: id })
    .execute();

  }
}

export default DeleteTransactionService;

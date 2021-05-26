import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';
import Category from '../models/Category';

import Transaction from '../models/Transaction';
//import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
} 

class CreateTransactionService {
  public async execute({title, value, type, category}: Request): Promise<Transaction> {
    const transactionRepository = getRepository(Transaction);
    const categoryRepository = getRepository(Category);

    const checkCategoryExists = await categoryRepository.findOne({
      where: { category },
  });
    
  let category_id: string = '';

  if (checkCategoryExists){
    category_id = checkCategoryExists.id;
  }
  else {
    const newCategory = categoryRepository.create({title: category});
    category_id = newCategory.id;
  }

    const transaction = transactionRepository.create({
            title,
            value,
            type,
            category_id
    });

    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;

import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';
import Category from '../models/Category';

import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
} 

class CreateTransactionService {
  public async execute({title, value, type, category}: Request): Promise<Transaction> {
    const transactionRepository = getCustomRepository(TransactionsRepository);
    const categoryRepository = getRepository(Category);

    if (type === 'outcome'){      
      const balance = transactionRepository.getBalance();
      const total = (await balance).outcome + value;
      if (total > (await balance).income) {
        throw new AppError('Valor não disponivel');
      }  
    }

    const checkCategoryExists = await categoryRepository.findOne({ where: { title: category } });

    let category_id: string = '';

    if (checkCategoryExists){
      category_id = checkCategoryExists.id;
    }
    else {
      const newCategory = await categoryRepository.create({title: category});
      await categoryRepository.save(newCategory);
      
      category_id = newCategory.id;
    }

    const transaction = await transactionRepository.create({
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

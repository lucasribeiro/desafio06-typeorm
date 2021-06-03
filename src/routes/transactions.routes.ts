import { Router } from 'express';
import { getCustomRepository } from 'typeorm';
import Transaction from '../models/Transaction';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
// import DeleteTransactionService from '../services/DeleteTransactionService';
// import ImportTransactionsService from '../services/ImportTransactionsService';

const transactionsRouter = Router();

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

interface Response {
  transactions: Transaction[];
  balance: Balance;
}

transactionsRouter.get('/', async (request, response) => {
  
  const transactionsRepository = getCustomRepository(TransactionsRepository);
  const transactions = await transactionsRepository.find({ relations: ["category"] });
  const balance = await transactionsRepository.getBalance();

  const resposta: Response = {transactions: transactions, balance: balance};

  return response.json(resposta);

});

transactionsRouter.post('/', async (request, response) => {

  const { title, value, type, category } = request.body;
  
  const createTransaction = new CreateTransactionService();
  
  const transaction =  await createTransaction.execute({
    title, 
    value,
    type,
    category
  });

  return response.json(transaction);
  
});

transactionsRouter.delete('/:id', async (request, response) => {
  // TODO
});

transactionsRouter.post('/import', async (request, response) => {
  // TODO
});

export default transactionsRouter;

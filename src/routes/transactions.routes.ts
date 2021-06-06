import { Router } from 'express';
import { getCustomRepository } from 'typeorm';
import Transaction from '../models/Transaction';
import multer from 'multer';
import uploadConfig from '../config/upload';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

const transactionsRouter = Router();
const upload = multer(uploadConfig);
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
  const transactions = await transactionsRepository.find();
  const balance = await transactionsRepository.getBalance();

  const resposta: Response = {transactions: transactions, balance: balance};

  return response.json(resposta);

});

transactionsRouter.post('/', async (request, response) => {
  try {
    const { title, value, type, category } = request.body;
    
    const createTransaction = new CreateTransactionService();
    
    const transaction =  await createTransaction.execute({
      title, 
      value,
      type,
      category
    });

    return response.json(transaction);

} catch (err) {
  return response.status(400).json({ error: err.message });
}
  
});

transactionsRouter.delete('/:id', async (request, response) => {

  const { id } = request.params;

  const deleteTransaction = new DeleteTransactionService();

  await deleteTransaction.execute(id);

  return response.json({ok: true});

});

transactionsRouter.post('/import',  upload.single('filecsv'), async (request, response) => {
  
  const filename = request.file.filename;

  const importTransaction = new ImportTransactionsService();

  importTransaction.execute(filename);

  return response.json({ok: true});
});

export default transactionsRouter;

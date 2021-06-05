import Transaction from '../models/Transaction';
import uploadConfig from "../config/upload";
import path from 'path';
import fs from 'fs';
import CreateTransactionService from '../services/CreateTransactionService';

class ImportTransactionsService {
  public async execute(csvFileName: string): Promise<void> {
    
    const csv = require('csv-parser');
    const fs = require('fs');

     fs.createReadStream(path.join(uploadConfig.directory, csvFileName))
      .pipe(csv())
      .on('data', (Transaction) => {
        console.log(Transaction);
        const transaction = Transaction as Transaction;

        console.log(transaction.value);

        const title = transaction.title;
        const value = transaction.value;
        const type = transaction.type;
        const category = transaction.category;

        const createTransaction = new CreateTransactionService();
       const newtransaction =  createTransaction.execute({
          title, 
          value,
          type,
          category
        });

      })
      .on('end', () => {
        console.log('CSV file successfully processed');
      });
 
    

  }
}

export default ImportTransactionsService;

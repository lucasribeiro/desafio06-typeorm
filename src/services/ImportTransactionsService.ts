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
      .on('data', (Transaction: Transaction) => {
        console.log(Transaction);

        let strTransaction = JSON.stringify(Transaction);        
        strTransaction = strTransaction.replace(' value', 'value');
        strTransaction = strTransaction.replace(' type', 'type');
        strTransaction = strTransaction.replace(' category', 'category');
        
        if (strTransaction.length > 2)
        {
          const transaction = JSON.parse(strTransaction);

          console.log(Transaction.value);

          const title = transaction.title;
          const value = transaction.value.trimLeft();
          const type = transaction.type.trimLeft();
          const category = transaction.category.trimLeft();

          const createTransaction = new CreateTransactionService();
          createTransaction.execute({
            title, 
            value,
            type,
            category
          });
          }
      })
      .on('end', () => {
        console.log('CSV file successfully processed');
      });
 
    

  }
}

export default ImportTransactionsService;

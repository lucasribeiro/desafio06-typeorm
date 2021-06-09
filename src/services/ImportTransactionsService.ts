import Transaction from '../models/Transaction';
import uploadConfig from "../config/upload";
import path from 'path';
import AppError from '../errors/AppError';
import { getCustomRepository, getRepository } from 'typeorm';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Category from '../models/Category';
import CreateTransactionService from './CreateTransactionService';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

interface CategoryAux {
  category: string;
  category_id: string;
}
class ImportTransactionsService {
  public async execute(csvFileName: string): Promise<Transaction[]> {

    const transactions: Request[] = [];
        
    const csv = require('csv-parser');
    const fs = require('fs');
    
    //fs.createReadStream(path.join(uploadConfig.directory, csvFileName))
     // .pipe(csv())

      const contactsReadStream = fs.createReadStream(path.join(uploadConfig.directory, csvFileName));
      const parseCSV = contactsReadStream.pipe(csv());

      parseCSV.on('data', async (Transaction: Request) => {
        console.log(Transaction);

        let strTransaction = JSON.stringify(Transaction);        
        strTransaction = strTransaction.replace(' value', 'value');
        strTransaction = strTransaction.replace(' type', 'type');
        strTransaction = strTransaction.replace(' category', 'category');
        
        if (strTransaction.length > 2)
        {
          const transaction = JSON.parse(strTransaction);

          const title = transaction.title;
          const value = transaction.value.trim();
          const type = transaction.type.trim();
          const category = transaction.category.trim();
          
          const request: Request = {title: title, value: value, type: type, category: category}
         
          transactions.push(request);

          console.log(request);                 
        }
      });
      
      await new Promise(resolve => parseCSV.on('end', resolve));
      
      await fs.promises.unlink(path.join(uploadConfig.directory, csvFileName));

      const response = this.SaveTransactions(transactions);
      return response;      
      
    }

    private async SaveTransactions(transactions: Request[]): Promise<Transaction[]> {
      
      const response: Transaction[] = [];
      const transactionRepository = getCustomRepository(TransactionsRepository);
      const categoryRepository = getRepository(Category);  

      // Salva os novos Categories
      const categoryList: CategoryAux[] = [];
      const categoriesAdded: string[] = [];

      await Promise.all(transactions.map(async trans =>  {  
        if (!categoriesAdded.some(ct => ct === trans.category)) {         
          categoriesAdded.push(trans.category);
          const checkCategoryExists = await categoryRepository.findOne({ where: { title: trans.category } });
          if (!checkCategoryExists){    
            const newCategory = await categoryRepository.create({title: trans.category});
            await categoryRepository.save(newCategory);       
            categoryList.push( { category: newCategory.title, category_id: newCategory.id} );                
          }
          else {
            categoryList.push( { category: checkCategoryExists.title, category_id: checkCategoryExists.id} );            
          }
        }        
      }));

      // Salva as transações
      try {
        await Promise.all(transactions.map(async trans =>  {
          
        const title = trans.title;
        const value = trans.value;
        const type = trans.type;
        let category_id = await categoryList.find(cat => cat.category === trans.category)?.category_id;
        
        const transaction = await transactionRepository.create({
                title,
                value,
                type,
                category_id
        });

        await transactionRepository.save(transaction);
        
       //await this.sleep(2000);


      }));

    }
    catch (err) {
      throw new AppError(err.message);
    }
    finally
    {
      return response;
    }    
  }

  private sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
}

export default ImportTransactionsService;

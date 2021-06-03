 import { EntityRepository, Repository } from 'typeorm';

 import Transaction from '../models/Transaction';

 interface Balance {
   income: number;
   outcome: number;
   total: number;
 }

 @EntityRepository(Transaction)
 class TransactionsRepository extends Repository<Transaction> {
   public async getBalance(): Promise<Balance> {
       
        const transactions = await this.find();

        const totalIncome = transactions.reduce((acumulador, current) => {    
            return acumulador += current.type === 'income' ? Number(current.value) : 0;
        }, 0);

        const totalOutcome = transactions.reduce((acumulador, current) => {    
            return acumulador += current.type === 'outcome' ? Number(current.value) : 0;
        }, 0);

        const total = totalIncome - totalOutcome;

        const balance: Balance = {income: totalIncome, outcome: totalOutcome, total: total};
            
        return balance;
   }
 }

 export default TransactionsRepository;

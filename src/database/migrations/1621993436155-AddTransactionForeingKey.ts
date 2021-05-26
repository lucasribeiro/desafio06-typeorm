import {MigrationInterface, QueryRunner, TableForeignKey} from "typeorm";

export class AddTransactionForeingKey1621993436155 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        
        await queryRunner.createForeignKey('transactions', 
            new TableForeignKey({
                name: 'fk_transaction_category',
                columnNames: ['category_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'categories',
                onDelete: 'SET NULL',
                onUpdate: 'CASCADE',
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropForeignKey('transactions', 'fk_transaction_category');               
    }

}

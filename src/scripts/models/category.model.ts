import { ICategory } from '../interfaces/category.model.interface'
import { IDatabase } from '../interfaces/database.interface';
import { IError } from '../interfaces/error.interface';

export class Category implements ICategory{
    static collection = 'categories'

    static getAll(database: IDatabase, mode: string): Promise<ICategory[] | IError>{
        return database.actor.getAll(this.collection, mode)
    }
}
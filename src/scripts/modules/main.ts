import { EDatabaseMode } from '../enums/database.enum'
import { IDatabase } from '../interfaces/database.interface'

import { Category } from '../models/category.model'

import { PWA } from '../modules/pwa'

class App{
    static database: IDatabase
    
    static async init(){
        // await PWA.registerSW()

        const { Database } = await import('../modules/database')
        this.database = Database

        await this.database.init()

        await PWA.registerSW()

        const docsOnline = await Category.getAll(this.database, EDatabaseMode.Online)
        console.log('docsOnline =', docsOnline)

        const docsLocal = await Category.getAll(this.database, EDatabaseMode.Local)
        console.log('docsLocal =', docsLocal)
    }
}

App.init()
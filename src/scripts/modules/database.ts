import { IDatabaseActor } from '../interfaces/database.actor.interface'
import { IDatabase } from '../interfaces/database.interface'
import { isBrowser, isServiceWorker, supportsWorkerType, supportsIndexedDB } from '../helpers/browser.helper'
import { getAstroPath } from '../helpers/astro.helper'
import { EDatabaseMode } from '../enums/database.enum'
import { Category } from '../models/category.model'
import { DatabaseActor } from '../actors/database.actor'

export class Database implements IDatabase{
    static supportsWorkerType = supportsWorkerType()
    static supportsLocalDB = supportsIndexedDB()
    static actor: IDatabaseActor | T
    static models: Object

    static async init(){
        console.log('this.supportsWorkerType =', this.supportsWorkerType)
        if ((isServiceWorker() || isBrowser()) && this.supportsWorkerType){
            console.log('running database in worker')
            const { wrap } = await import('comlink')
            const url = new URL(`${getAstroPath()}scripts/workers/database.worker.js`, import.meta.url)
            const worker = new Worker(url, { type: 'module' })
            this.actor = await wrap(worker)
        }else this.actor = DatabaseActor
        
        await this.actor.init(EDatabaseMode.Online)

        if (isServiceWorker() || isBrowser()){
            console.log('installing local database')
            console.log('this.supportsLocalDb =', this.supportsLocalDb)
            if (this.supportsLocalDB){
                const { isOfflineFirst, isFirstLoad } = await this.actor.init(EDatabaseMode.Local)
                if (isOfflineFirst && isFirstLoad) await this.loadLocalDatabase()
            }
        }
    }

    static async initModels(){
        this.models = {
            'categories': await Category.getAll(this, EDatabaseMode.Online)
        }
    }

    static async loadLocalDatabase(){
        console.log('loadLocalDatabase')
        await this.initModels()

        await Promise.all(
            Object.keys(this.models)
                .map(collectionName => {
                    const docs = this.models[collectionName];
                    console.info(`Loaded ${docs.length} docs in '${collectionName}'`);
                    return docs
                        .map(doc => this.actor.add(collectionName, doc, EDatabaseMode.Local));
                })
        );
    }
}
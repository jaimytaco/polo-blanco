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

    static async init(){
        if ((isServiceWorker() || isBrowser()) && this.supportsWorkerType){
            const { wrap } = await import('comlink')
            const url = new URL(`${getAstroPath()}scripts/workers/database.worker.js`, import.meta.url)
            const worker = new Worker(url, { type: 'module' })
            this.actor = await wrap(worker)
        }else this.actor = DatabaseActor
        // this.actor = DatabaseActor
        
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

    static async loadLocalDatabase(){
        console.log('loadLocalDatabase')
        const modelsToLoad = {
            'categories': await Category.getAll(this, EDatabaseMode.Online)
        };

        await Promise.all(
            Object.keys(modelsToLoad)
                .map(collectionName => {
                    const docs = modelsToLoad[collectionName];
                    console.info(`Loaded ${docs.length} docs in '${collectionName}'`);
                    return docs
                        .map(doc => this.actor.add(collectionName, doc, EDatabaseMode.Local));
                })
        );
    }
}
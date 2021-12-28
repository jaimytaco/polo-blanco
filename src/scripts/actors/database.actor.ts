import { EDatabaseMode } from '../enums/database.enum'
import { getServiceWorkerContainer } from '../helpers/browser.helper'
import { IDatabaseActor } from '../interfaces/database.actor.interface'
import { Firebase as OnlineDB } from '../services/firebase.service'
import { IndexedDb as LocalDB } from '../services/indexedDb.service'

export class DatabaseActor implements IDatabaseActor{
    static init(mode: string){
        if (mode === EDatabaseMode.Online) return OnlineDB.init()
        if (mode === EDatabaseMode.Local) return LocalDB.init(!getServiceWorkerContainer())
    }

    static getAll(collectionName: string, mode: string){
        if (mode === EDatabaseMode.Online) return OnlineDB.getAll(collectionName)
        if (mode === EDatabaseMode.Local) return LocalDB.getInitialData(collectionName, 'all')
    }

    static add(collectionName: string, doc: any, mode: string): Promise<any>{
        // if (mode === EDatabaseMode.Online) return OnlineDB.add(collectionName, doc);
        if (mode === EDatabaseMode.Local) return LocalDB.add(collectionName, doc);
    }
}
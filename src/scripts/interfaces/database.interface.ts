import { IDatabaseActor } from '../interfaces/database.actor.interface'

export class IDatabase{
    supportsWorkerType: boolean
    supportsLocalDB: boolean
    actor: IDatabaseActor | T
    init: Function
    loadLocalDatabase: Function 
}
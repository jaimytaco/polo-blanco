export interface IIndexedDB extends IDBFactory{
    databases: Function
}

export interface IIndexedDBDatabase{
    name: string
    version: number
}
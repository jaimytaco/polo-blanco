export interface IDatabaseActor{
    init: Function
    getAll: Function
    add: Function
}

export interface IDatabaseActorFilter {
    method: 'id' | 'all' | 'where' | 'where-by'
    key?: string
    operator?: '<' | '<=' | '==' | '>' | '>=' | 'array-contains' | 'array-contains-any' | 'in' | 'not-in'
    value?: any
}
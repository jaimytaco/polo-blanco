import { IIndexedDB, IIndexedDBDatabase } from '../interfaces/browser.interface'

export function isNode(){
    return typeof process !== 'undefined'
}

export function isBrowser(){
    return typeof window === 'object'
}

export function isWorker(){
    return typeof importScripts === 'function'
}

export function isServiceWorker(){
    return typeof ServiceWorkerGlobalScope !== 'undefined'
}

// Taken from https://stackoverflow.com/questions/62954570/javascript-feature-detect-module-support-for-web-workers
export function supportsWorkerType(){
    let supports = false;
    const tester: any = {
        get type() { 
            supports = true
            return 
        } // it's been called, it's supported
    };
    try {
        // We use "blob://" as url to avoid an useless network request.
        // This will either throw in Chrome
        // either fire an error event in Firefox
        // which is perfect since
        // we don't need the worker to actually start,
        // checking for the type of the script is done before trying to load it.
        const worker = new Worker('blob://', tester)
    } finally {
        return supports
    }
}

export function supportsIndexedDB() {
    return isBrowser() ? !!window.indexedDB : false
}

export function getIndexedDBDatabases(): Promise<IIndexedDBDatabase[]>{
    return (indexedDB as IIndexedDB).databases()
}

export function getServiceWorkerContainer(){
    return navigator.serviceWorker
}
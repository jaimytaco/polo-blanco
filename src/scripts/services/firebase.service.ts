import { IError } from '../interfaces/error.interface'
import { isBrowser, isWorker, isNode } from '../helpers/browser.helper'

import { initializeApp as initializeApp_JS } from '../libs/firebase-app-JS'
import { getFirestore as getFirestore_JS, collection as collection_JS, getDocs as getDocs_JS } from '../libs/firebase-firestore-JS'


export class Firebase {
    static app: any
    static firestore: any
    static FIREBASE_VERSION = '9.6.1'
    static FIREBASE_APP_NODE = 'firebase/app'
    static FIREBASE_FIRESTORE_NODE = 'firebase/firestore'
    static FIREBASE_APP_JS: string
    static FIREBASE_FIRESTORE_JS: string
    static FIREBASE_CONFIG = {
        apiKey: "AIzaSyC5hUyetFI48VPkaEb4A5vjqdzTETHXfTo",
        authDomain: "blog-neo.firebaseapp.com",
        databaseURL: "https://blog-neo.firebaseio.com",
        projectId: "blog-neo",
        storageBucket: "blog-neo.appspot.com",
        messagingSenderId: "163045984594",
        appId: "1:163045984594:web:39a36f5e60b8e3a5fb928b"
    }
    static initializeApp: Function
    static getFirestore: Function
    static collection: Function
    static getDocs: Function

    static async init() {
        this.FIREBASE_APP_JS = `https://www.gstatic.com/firebasejs/${this.FIREBASE_VERSION}/firebase-app.js`
        this.FIREBASE_FIRESTORE_JS = `https://www.gstatic.com/firebasejs/${this.FIREBASE_VERSION}/firebase-firestore.js`

        if (isNode()){
            const { initializeApp } = await import(this.FIREBASE_APP_NODE)
            const { getFirestore, collection, getDocs } = await import(this.FIREBASE_FIRESTORE_NODE)

            this.initializeApp = initializeApp
            this.getFirestore = getFirestore
            this.collection = collection
            this.getDocs = getDocs
        }else{
            this.initializeApp = initializeApp_JS
            this.getFirestore = getFirestore_JS
            this.collection = collection_JS
            this.getDocs = getDocs_JS
        }

        this.app = this.initializeApp(this.FIREBASE_CONFIG)
        this.firestore = this.getFirestore(this.app)
    }

    static async getAll(collectionName: string): Promise<any[] | IError> {
        try {
            const q = this.collection(this.firestore, collectionName)
            const snapshot = await this.getDocs(q)
            const docs = snapshot.docs
                .map(function (doc) {
                    const data = doc.data()
                    data.id = doc.id
                    return data
                })
            return docs
        } catch (err) {
            return { err }
        }
    }
}
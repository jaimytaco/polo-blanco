import { IDatabase } from '../interfaces/database.interface'
import { Database } from '../modules/database'
import { EDatabaseMode } from '../enums/database.enum'
import { Category } from '../models/category.model'
import { IView, IViewContent, IViewContentHead } from '../interfaces/viewGenerator.interface'


export class ViewGenerator {
    static database: IDatabase

    static async initDatabase() {
        this.database = Database
        await this.database.init()
    }

    static getViewGenerator(viewId: string): Function | undefined {
        const database = this.database

        return {
            'public-dynamic': async function (): IViewContent {
                const categories = await Category.getAll(database, EDatabaseMode.Local)
                return {
                    head: {
                        title: 'Dynamic | Polo Blanco',
                        meta: ''
                    },
                    body: `
                        <h1>Dynamic view rendered with streams</h1>
                        ${
                            categories
                                .map(function (doc) {
                                    return `<a style="width: 100%; display: block;" href="/category/${doc.slug}">Go to ${doc.slug}</a>`
                                })
                                .join('')
                        }
                    `
                }
            }
        }[viewId]
    }

    static getViewIdByPathname(pathname: string): string | undefined {
        return {
            '/dynamic': 'public-dynamic'
        }[pathname]
    }

    static async getViewContent(viewId: string): IView {
        const contentFn = this.getViewGenerator(viewId)
        const content = contentFn ? await contentFn() : null
        const err = !content ? 'view not found' : null

        return {
            content,
            err
        }
    }

    static async getDynamicContent({ pathname, viewId }): IView {
        if (!viewId) viewId = this.getViewIdByPathname(pathname)

        return this.getViewContent(viewId)
    }
}
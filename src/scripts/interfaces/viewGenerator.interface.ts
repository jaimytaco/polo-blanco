import { IError } from '../interfaces/error.interface'

export interface IViewContentHead {
    title: string,
    meta: string
}

export interface IViewContent {
    head: IViewContentHead,
    body: string
}

export interface IView implements IError {
    content: IViewContent
}
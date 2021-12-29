import { Router } from '/_astro/src/scripts/modules/router.js'

const STATIC_CACHE_PREFIX = 'sw-poloblanco'
const STATIC_CACHE_VERSION = 48
const STATIC_CACHE_NAME = `${STATIC_CACHE_PREFIX}-static-${STATIC_CACHE_VERSION}`

const ALL_CACHES = [
    STATIC_CACHE_NAME
]

const STATIC_ROUTES = [
    '/',
    '/blank',
    '/404'
]

const ASSETS = [
    '/favicon.ico'
]

const STYLES = [
    '/_astro/src/scripts/styles/utils.css'
]

const SCRIPTS = [
    '/_snowpack/env.js',
    '/_snowpack/pkg/idb.v7.0.0.js',
    '/_snowpack/pkg/comlink.v4.3.1.js',


    '/_astro/src/scripts/actors/database.actor.js',

    '/_astro/src/scripts/enums/database.enum.js',

    '/_astro/src/scripts/helpers/astro.helper.js',
    '/_astro/src/scripts/helpers/browser.helper.js',

    // '/_astro/src/scripts/interfaces/browser.interface.js',
    // '/_astro/src/scripts/interfaces/category.model.interface.js',
    // '/_astro/src/scripts/interfaces/database.actor.interface.js',
    // '/_astro/src/scripts/interfaces/error.interface.js',
    // '/_astro/src/scripts/interfaces/localDb.model.interface.js',

    '/_astro/src/scripts/libs/firebase-app-JS.js',
    '/_astro/src/scripts/libs/firebase-firestore-JS.js',

    '/_astro/src/scripts/models/category.model.js',

    '/_astro/src/scripts/modules/database.js',
    '/_astro/src/scripts/modules/main.js',
    '/_astro/src/scripts/modules/pwa.js',
    '/_astro/src/scripts/modules/router.js',

    '/_astro/src/scripts/services/firebase.service.js',
    '/_astro/src/scripts/services/indexedDb.service.js',

    '/_astro/src/scripts/workers/database.worker.js'
]

const TO_CACHE = [
    ...STATIC_ROUTES,
    ...ASSETS,
    ...STYLES,
    ...SCRIPTS
]

const cacheStaticAssets = async _ => {
    try {
        const cache = await caches.open(STATIC_CACHE_NAME)
        cache.addAll(TO_CACHE)
    } catch (err) {
        console.error(err)
    }
}

const serveFromCache = async request => {
    const response = await caches.match(request, { ignoreSearch: true })
    if (!response || request.url.origin === location.origin) console.info(`${request.url} served without cache`)
    return response || fetch(request)
}

const streamHTML = (e, htmls) => {
    const responsePromises = htmls
        .map(html => new Response(html, {
            headers: { 'Content-Type': 'text/html; charset=utf-8' }
        }))

    const { readable, writable } = new TransformStream()

    e.waitUntil(async function () {
        for (const responsePromise of responsePromises) {
            const response = await responsePromise
            await response.body.pipeTo(writable, { preventClose: true })
        }
        writable.getWriter().close()
    }())

    return new Response(readable, {
        headers: {
            'Content-Type': 'text/html; charset=utf-8'
        }
    })
}

addEventListener('install', e => {
    e.waitUntil(cacheStaticAssets())
    skipWaiting()
})

addEventListener('activate', e => {
    e.waitUntil(async function () {
        const cacheNames = await caches.keys()
        return Promise.all(
            cacheNames
                .filter(cacheName => cacheName.startsWith(STATIC_CACHE_PREFIX) && !ALL_CACHES.includes(cacheName))
                .map(cacheName => caches.delete(cacheName))
        )
    }())
})

const serveWithStream = async (e, content) => {
    const response = await caches.match(new Request('/blank'))
    const blank = await response.text()
    const html = blank
        .replace('<!-- [DYNAMIC TITLE] -->', content.head.title)
        .replace('<!-- [DYNAMIC META] -->', content.head.meta)
        .replace('<!-- [DYNAMIC BODY] -->', content.body)

    return streamHTML(e, [
        html
    ])
}

const serveDynamically = async (e, pathname) => {
    const { content, err } = await Router.getDynamicContent({ pathname })

    return err ? serveFromCache(new Request('/404')) : serveWithStream(e, content)
}

addEventListener('fetch', e => {
    const url = new URL(e.request.url)
    const { origin, pathname, href } = url
    const bypassFetch = href.includes('hmr-client.js') || location.origin !== origin

    if (!bypassFetch) e.respondWith(TO_CACHE.includes(pathname) ? serveFromCache(e.request) : serveDynamically(e, pathname))
})
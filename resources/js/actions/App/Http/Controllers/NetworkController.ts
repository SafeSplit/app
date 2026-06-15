import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\NetworkController::index
* @see app/Http/Controllers/NetworkController.php:12
* @route '/network'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/network',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\NetworkController::index
* @see app/Http/Controllers/NetworkController.php:12
* @route '/network'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\NetworkController::index
* @see app/Http/Controllers/NetworkController.php:12
* @route '/network'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\NetworkController::index
* @see app/Http/Controllers/NetworkController.php:12
* @route '/network'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

const NetworkController = { index }

export default NetworkController
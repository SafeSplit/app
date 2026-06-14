import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../wayfinder'
import members from './members'
/**
* @see \App\Http\Controllers\GroupController::store
* @see app/Http/Controllers/GroupController.php:32
* @route '/groups'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/groups',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\GroupController::store
* @see app/Http/Controllers/GroupController.php:32
* @route '/groups'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\GroupController::store
* @see app/Http/Controllers/GroupController.php:32
* @route '/groups'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\GroupController::show
* @see app/Http/Controllers/GroupController.php:54
* @route '/groups/{group}'
*/
export const show = (args: { group: string | number | { id: string | number } } | [group: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/groups/{group}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\GroupController::show
* @see app/Http/Controllers/GroupController.php:54
* @route '/groups/{group}'
*/
show.url = (args: { group: string | number | { id: string | number } } | [group: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { group: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { group: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            group: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        group: typeof args.group === 'object'
        ? args.group.id
        : args.group,
    }

    return show.definition.url
            .replace('{group}', parsedArgs.group.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\GroupController::show
* @see app/Http/Controllers/GroupController.php:54
* @route '/groups/{group}'
*/
show.get = (args: { group: string | number | { id: string | number } } | [group: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\GroupController::show
* @see app/Http/Controllers/GroupController.php:54
* @route '/groups/{group}'
*/
show.head = (args: { group: string | number | { id: string | number } } | [group: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

const groups = {
    store: Object.assign(store, store),
    show: Object.assign(show, show),
    members: Object.assign(members, members),
}

export default groups
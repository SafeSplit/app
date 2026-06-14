import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\GroupMemberController::store
* @see app/Http/Controllers/GroupMemberController.php:14
* @route '/groups/{group}/members'
*/
export const store = (args: { group: string | number | { id: string | number } } | [group: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/groups/{group}/members',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\GroupMemberController::store
* @see app/Http/Controllers/GroupMemberController.php:14
* @route '/groups/{group}/members'
*/
store.url = (args: { group: string | number | { id: string | number } } | [group: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
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

    return store.definition.url
            .replace('{group}', parsedArgs.group.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\GroupMemberController::store
* @see app/Http/Controllers/GroupMemberController.php:14
* @route '/groups/{group}/members'
*/
store.post = (args: { group: string | number | { id: string | number } } | [group: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

const members = {
    store: Object.assign(store, store),
}

export default members
import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\SettlementController::store
* @see app/Http/Controllers/SettlementController.php:17
* @route '/groups/{group}/settlements'
*/
export const store = (args: { group: number | { id: number } } | [group: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/groups/{group}/settlements',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\SettlementController::store
* @see app/Http/Controllers/SettlementController.php:17
* @route '/groups/{group}/settlements'
*/
store.url = (args: { group: number | { id: number } } | [group: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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
* @see \App\Http\Controllers\SettlementController::store
* @see app/Http/Controllers/SettlementController.php:17
* @route '/groups/{group}/settlements'
*/
store.post = (args: { group: number | { id: number } } | [group: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\SettlementController::accept
* @see app/Http/Controllers/SettlementController.php:61
* @route '/settlements/{settlement}/accept'
*/
export const accept = (args: { settlement: number | { id: number } } | [settlement: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: accept.url(args, options),
    method: 'post',
})

accept.definition = {
    methods: ["post"],
    url: '/settlements/{settlement}/accept',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\SettlementController::accept
* @see app/Http/Controllers/SettlementController.php:61
* @route '/settlements/{settlement}/accept'
*/
accept.url = (args: { settlement: number | { id: number } } | [settlement: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { settlement: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { settlement: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            settlement: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        settlement: typeof args.settlement === 'object'
        ? args.settlement.id
        : args.settlement,
    }

    return accept.definition.url
            .replace('{settlement}', parsedArgs.settlement.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\SettlementController::accept
* @see app/Http/Controllers/SettlementController.php:61
* @route '/settlements/{settlement}/accept'
*/
accept.post = (args: { settlement: number | { id: number } } | [settlement: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: accept.url(args, options),
    method: 'post',
})

const SettlementController = { store, accept }

export default SettlementController
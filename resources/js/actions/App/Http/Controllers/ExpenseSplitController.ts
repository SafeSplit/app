import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\ExpenseSplitController::accept
* @see app/Http/Controllers/ExpenseSplitController.php:14
* @route '/expenses/{expense}/accept'
*/
export const accept = (args: { expense: number | { id: number } } | [expense: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: accept.url(args, options),
    method: 'post',
})

accept.definition = {
    methods: ["post"],
    url: '/expenses/{expense}/accept',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ExpenseSplitController::accept
* @see app/Http/Controllers/ExpenseSplitController.php:14
* @route '/expenses/{expense}/accept'
*/
accept.url = (args: { expense: number | { id: number } } | [expense: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { expense: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { expense: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            expense: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        expense: typeof args.expense === 'object'
        ? args.expense.id
        : args.expense,
    }

    return accept.definition.url
            .replace('{expense}', parsedArgs.expense.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ExpenseSplitController::accept
* @see app/Http/Controllers/ExpenseSplitController.php:14
* @route '/expenses/{expense}/accept'
*/
accept.post = (args: { expense: number | { id: number } } | [expense: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: accept.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\ExpenseSplitController::reject
* @see app/Http/Controllers/ExpenseSplitController.php:20
* @route '/expenses/{expense}/reject'
*/
export const reject = (args: { expense: number | { id: number } } | [expense: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reject.url(args, options),
    method: 'post',
})

reject.definition = {
    methods: ["post"],
    url: '/expenses/{expense}/reject',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ExpenseSplitController::reject
* @see app/Http/Controllers/ExpenseSplitController.php:20
* @route '/expenses/{expense}/reject'
*/
reject.url = (args: { expense: number | { id: number } } | [expense: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { expense: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { expense: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            expense: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        expense: typeof args.expense === 'object'
        ? args.expense.id
        : args.expense,
    }

    return reject.definition.url
            .replace('{expense}', parsedArgs.expense.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ExpenseSplitController::reject
* @see app/Http/Controllers/ExpenseSplitController.php:20
* @route '/expenses/{expense}/reject'
*/
reject.post = (args: { expense: number | { id: number } } | [expense: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reject.url(args, options),
    method: 'post',
})

const ExpenseSplitController = { accept, reject }

export default ExpenseSplitController
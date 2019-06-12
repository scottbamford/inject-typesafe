import { IServiceScope } from "./IServiceScope";

/**
 * Provider for retrieving a service object.
 */
export interface IServiceProvider<TServiceCollection = any> {
    /**
     * Returns the typesafe service collection of [[ServiceResolver]]s for your services.
     */
    services(): TServiceCollection;

    /**
     * Create a new scope.  Scoped services are not linked to the parent scope, and are stored only for the lifetime of the scope.
     */
    createScope(): IServiceScope<TServiceCollection>;
}

import { ServiceFactory } from './ServiceFactory';
import { ServiceResolver } from './ServiceResolver';

/**
 * Builder that is used when configuringServices with [[ConfigureServices]] to attach the appropriate scope [[ServiceResolver]] to [[ServiceFactory]] methods.
 * 
 * Unlike many other dependency injection frameworks we don't have a base IServiceCollection (or similar class) that you add all registrations to, instead we use
 * have you constructor your own typesafe Service Collection using these helper methods.
 */
export interface IServiceCollectionBuilder<TServiceCollection> {
    /**
     * Add a service that should resolve with transiant scope.
     * 
     * Services registered as transiant will have a new instance created each time one is resolved from the [[IServiceProvider]].
     * @param factory
     */
    trainsiant<T>(factory: ServiceFactory<TServiceCollection, T>): ServiceResolver<T>;

    /**
     * Add a service that should resolve with a scope defined by the lifetime [[IServiceProvider]] or [[IServiceScope]].
     * 
     * Services registered as scoped will have a single instance instance created and returned each time one is resolved from the same [[IServiceProvider]] or [[IServiceScope]].
     * Scoped services are not shared with the children created via [[IServiceProvider.createScope()]].
     * @param factory
     */
    scoped<T>(factory: ServiceFactory<TServiceCollection, T>): ServiceResolver<T>;

    /**
     * Add a service that should resolve with singleton scoped defined by the lifetime of [[IServiceProvider]].
     * 
     * Services registered as singleton will have a single instance instance created and returned each time one is resolved from the same [[IServiceProvider]] or any child [[IServiceScope]].
     * Singleton services are shared with the children created via [[IServiceProvider.createScope()]] and all child [[IServiceScope]]s created via [[IServiceProvider.createScope()]] share the singleton instance with its parent.
     * @param factory
     */
    singleton<T>(factory: ServiceFactory<TServiceCollection, T>): ServiceResolver<T>;
}
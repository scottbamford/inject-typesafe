import { IServiceCollectionBuilder } from "../abstract/IServiceCollectionBuilder";
import { ServiceProvider } from "./ServiceProvider";
import { ServiceFactory } from "../abstract/ServiceFactory";
import { ServiceResolver } from "../abstract/ServiceResolver";

/**
 * Implementation of [[IServiceCollectionBuilder]] that is built to work alongside [[ServiceProvider]].
 */
export class ServiceCollectionBuilder<TServiceCollection> implements IServiceCollectionBuilder<TServiceCollection> {
    private readonly provider: ServiceProvider<TServiceCollection>;

    constructor(provider: ServiceProvider<TServiceCollection>) {
        this.provider = provider;
    }

    /**
     * Add a service that should resolve with transiant scope.
     * 
     * Services registered as transiant will have a new instance created each time one is resolved from the [[IServiceProvider]].
     * @param factory
     */
    trainsiant<T>(factory: ServiceFactory<TServiceCollection, T>): ServiceResolver<T> {
        return () => this.provider.getTransiant(factory);
    }

    /**
     * Add a service that should resolve with a scope defined by the lifetime [[IServiceProvider]] or [[IServiceScope]].
     * 
     * Services registered as scoped will have a single instance instance created and returned each time one is resolved from the same [[IServiceProvider]] or [[IServiceScope]].
     * Scoped services are not shared with the children created via [[IServiceProvider.createScope()]].
     * @param factory
     */
    scoped<T>(factory: ServiceFactory<TServiceCollection, T>): ServiceResolver<T> {
        return () => this.provider.getScoped(factory);
    }

    /**
     * Add a service that should resolve with singleton scoped defined by the lifetime of [[IServiceProvider]].
     * 
     * Services registered as singleton will have a single instance instance created and returned each time one is resolved from the same [[IServiceProvider]] or any child [[IServiceScope]].
     * Singleton services are shared with the children created via [[IServiceProvider.createScope()]] and all child [[IServiceScope]]s created via [[IServiceProvider.createScope()]] share the singleton instance with its parent.
     * @param factory
     */
    singleton<T>(factory: ServiceFactory<TServiceCollection, T>): ServiceResolver<T> {
        return () => this.provider.getSingleton(factory);
    }
}

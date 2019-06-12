import { ConfigureServices } from "../abstract/ConfigureServices";
import { IServiceProvider } from "../abstract/IServiceProvider";
import { IServiceScope } from "../abstract/IServiceScope";
import { ServiceFactory } from "../abstract/ServiceFactory";
import { ServiceCollectionBuilder } from "./ServiceCollectionBuilder";

/**
 * Implementation of [[IServiceProvider]] and [[IServiceScope]] that accepts [[ConfigureServices]] as the single required constructor argument.
 */
export class ServiceProvider<TServiceCollection> implements IServiceProvider<TServiceCollection>, IServiceScope {
    private readonly configureServices: ConfigureServices<TServiceCollection>;
    private readonly _services: TServiceCollection;
    private readonly singletonStore: Map<ServiceFactory<any, any>, any>;
    private readonly scopeStore: Map<ServiceFactory<any, any>, any>;

    constructor(configureServices: ConfigureServices<TServiceCollection>, singletonStore?: Map<ServiceFactory<any, any>, any>, scopeStore?: Map<ServiceFactory<any, any>, any>) {
        let builder = new ServiceCollectionBuilder<TServiceCollection>(this);
        this._services = configureServices(builder);

        this.singletonStore = singletonStore || new Map<ServiceFactory<any, any>, any>();
        this.scopeStore = scopeStore || new Map<ServiceFactory<any, any>, any>();
        this.configureServices = configureServices;
    }

    /**
     * Returns the typesafe service collection of [[ServiceResolver]]s for your services.
     */
    services(): TServiceCollection {
        return this._services;
    }

    /**
     * Create a new scope.  Scoped services are not linked to the parent scope, and are stored only for the lifetime of the scope.
     */
    createScope(): IServiceScope<TServiceCollection> {
        // Create a new provider that contains a new scope.
        return new ServiceProvider<TServiceCollection>(this.configureServices, this.singletonStore, new Map<ServiceFactory<any, any>, any>());
    }

    /**
     * Returns a singleton service either from the store or by calling the factory.
     * 
     * This method is not normally used directly, you should normally use services() instead.
     * @param factory
     */
    getSingleton<T>(factory: ServiceFactory<TServiceCollection, T>) {
        if (this.singletonStore.has(factory)) {
            return this.singletonStore.get(factory);
        }

        let ret = factory(this.services());
        this.singletonStore.set(factory, ret);
        return ret;
    }

    /**
     * Returns a scoped service either from the store or by calling the factory.
     *
     * This method is not normally used directly, you should normally use services() instead.
     * @param factory
     */
    getScoped<T>(factory: ServiceFactory<TServiceCollection, T>) {
        if (this.scopeStore.has(factory)) {
            return this.scopeStore.get(factory);
        }

        let ret = factory(this.services());
        this.scopeStore.set(factory, ret);
        return ret;
    }

    /**
     * Returns a transiant service by calling the factory.
     *
     * This method is not normally used directly, you should normally use services() instead.
     * @param factory
     */
    getTransiant<T>(factory: ServiceFactory<TServiceCollection, T>) {
        return factory(this.services());
    }
}
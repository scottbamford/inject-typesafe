/**
 * Factory function used to declare how to resolve a service.
 */
export type ServiceFactory<TServiceCollection, TResult> = (services: TServiceCollection) => TResult;
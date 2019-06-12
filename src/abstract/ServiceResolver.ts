/**
 * Fuction used to resolve a service from the [[IServiceProvider.services]].
 */
export type ServiceResolver<T> = () => T;

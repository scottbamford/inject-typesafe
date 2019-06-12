import { IServiceProvider } from "./IServiceProvider";

/**
 * IServiceProvider created via [[IServiceProvider.createScope()]] that contains a new scope for scoped types.
 */
export interface IServiceScope<TServiceCollection = any> extends IServiceProvider<TServiceCollection> {
}

import { IServiceCollectionBuilder } from "./IServiceCollectionBuilder";

/**
 * Function used to configure the available services and map them to your own ServiceCollection type.
 */
export type ConfigureServices<TServiceCollection> = (builder: IServiceCollectionBuilder<TServiceCollection>) => TServiceCollection;

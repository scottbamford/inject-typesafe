# Inject Typesafe (inject-typesafe)

The worlds smallest 100% typesafe dependency injection framework.

Inject Typesafe is a 100% typesafe dependency injection framework for typescript that takes a alternative very lightweight approach
to dependency injection that feels more like state management than a black box.

All in less than 100 lines of code (excluding comments) and no dependencies except typescript.

We do:
* Provide complete type safety end to end for your dependencies.
* Check you haven't used an undeclared dependency using type safety.
* Check you haven't forgot to initialise a dependency using type safety.
* Support injection into all classes via their public APIs without requiring them to be specially designed or changed for our dependency injection.
* Support contstructor based injection.
* Support property based injections.
* Support functions as dependencies.
* Support constants, basic types, generics, interface, and all other features of the typescript type system.
* Support for classes, interfaces, and factories.
* Support singleton, scoped, and transiant dependency lifecycles.
* Support composing your dependencies by combining seperate lists of dependencies.
* Support react with both hooks and higher-order components (via the package inject-typesafe-react).
* Support code completion in code editors (once again thanks to our type safety).


We do not:
* Require decorators, special properties, base classes, or otherwise ask you to litter your own classes with any kind of markup or special code.
* Have a dependency on or use reflection-metadata or any other runtime metadata.
* Use any kind of magic string, tokens, symbol, or special static properties in the decleration or consumption of depdendencies.
* Bring any other dependencies or overhead to your application.
* Wrap any underlying untypesafe javascript library with a set type definitions (we write in and design for typescript).
* Require you to make any changes your class or function design to use our dependency injection.
* Limit ourselves use to only object orientated code.
* Tell you how you should structure your code just because you use this library for depdency injection.

```

## Installation

Install inject-typesafe locally within your project folder, like so:

```shell
npm install inject-typesafe
```

Or with yarn:

```shell
yarn add inject-typesafe
```

If you use react and want to use our react support you should also:

```shell
npm install inject-typesafe-react
```

Or with yarn:

```shell
yarn add inject-typesafe-react
```

## Basic Usage

In many ways our APIs feel more like declaring your application state than traditional dependency injection.

You simply declare your dependencies:

```ts
import { ServiceResolver, ConfigureServices } from 'inject-typesafe';

export interface AppServices {
    animal: ServiceResolver<Animal>,
	color: ServiceResolver<Color>,
}
```

Configure your dependencies:

```ts
export const configureServices: ConfigureServices<AppServices> = (builder) => ({
	animal: builder.scoped(services => new Dog(services.color()),
	color: builder.singleton(services => new Red())
});
```

And consume your dependencies:

```ts
import { ServiceProvider } from 'inject-typesafe';

const serviceProvider = new ServiceProvider(configureServices);
let services = serviceProvider.services();

let myAnimal = services.animal();
// myAnimal is now resolved and initalised as new Dog(new Red())
```

And at every state things are kept typesafe.

By convention the decleration (AppServices in the example) and configuration (configureServices in the example) are usually
placed in a file configureServices.ts in the root of your file, but you can store them anywhere you want.

You can also split your services up into smaller chunks if you need to, see "Can I seperate my dependencies out?" in the FAQ.

## Usage with react

If you use react, we provide the inject-typesafe-react package to give you Context, hook, and high-order-component (hoc) to work with your
dependencies anywhere:

```ts
// In your App.tsx
const serviceProvider = new ServiceProvider(configureServices);

export const App = (props: any) => {
    return (
        <InjectContext.Provider value={serviceProvider}>
			<TheRestOfYourAppGoesHere />
        </InjectContext.Provider>
    );
};
```

### Higher-order component

Using a higher order component to set your props to services:

```ts
import { withInjectedProps } from 'inject-typesafe-react';

interface MyComponentProps {
	animal: Animal
}

const _MyComponent = (props: MyComponentProps) => {
	return (
		<div>
			I have a {animal.describe()}.
		</div>
		);
};

export const MyComponent = withInjectedProps<MyComponentProps, AppServices>(services => ({
    animal: services.animal()
}))(_MyComponent);
```

This use of a higher order component to resolve dependencies should look very familiar if you've ever used redux and its connect() method
to resolve application state into props before.

### Hooks

You can also use a hook:

```ts
import { withInjectedProps } from 'inject-typesafe-react';

interface MyComponentProps {
}

const MyComponent = (props: MyComponentProps) => {
	const animal = useInjected(services => services.animal());

	return (
		<div>
			I have a {animal.describe()}.
		</div>
		);
};
```

You can also resolve multiple dependencies at the same time:

```ts
	const { animal, color } = useInjected(services => { services.animal(), services.color() });
```

When you do this all dependencies resolved at the same time will share the same scope (i.e. the Color used by animal will be the exact same
instance of Red() as color.)

When using any dependency injection within a function (such as a using our hook) we recommend (but don't require) that you still expose
your dependency on Animal through your props, and only use the value direct from services when you are not passed in a value.  This helps
in avoiding hidden dependencies and falling into using useInjected() as a service locator.

```ts
import { withInjectedProps } from 'inject-typesafe-react';

interface MyComponentProps {
	animal?: Animal
}

const MyComponent = (props: MyComponentProps) => {
	const animal = useInjected(services => props.animal || services.animal());

	return (
		<div>
			I have a {animal.describe()}.
		</div>
		);
};
```

Or for multiple dependencies:

```ts
import { withInjectedProps } from 'inject-typesafe-react';

interface MyComponentProps {
	animal?: Animal,
	color?: Color
}

const MyComponent = (props: MyComponentProps) => {
	const animal = useInjected(services => new {
		animal: props.animal || services.animal(),
		color: props.color || services.color()
	});

	return (
		<div style={color: color.hex}>
			I have a {animal.describe()}.
		</div>
		);
};
```

## FAQ

### Can I store constants or static values as dependencies

Yes you can store constants as dependencies:

```ts
const defaultSettings = {
	setting1: 'some value',
	setting2: 'another value'
};

export interface AppServices {
	defaultSettings: ServiceResolver<Settings>,
	passwordOptions: ServiceResolver<PasswordOptions>
}

export const configureServices: ConfigureServices<AppServices> = (builder) => ({
	// Resolve to a constant elsewhere
	defaultSettings: builder.singleton(services => defaultSettings),

	// Resolve a constant declared value inline
	passwordOptions: builder.singleton(services => { requiredLength: 6, requireUppercase: true, requireNumber: false }),
});
```

### Can I store functions as dependencies or do they have to be objects.

You can store functions as dependency, or even basic types such as number or string.

You don't need to do anything special to use functions or values as depenencies, you just declare and configure them as you would any other type

```ts
export interface AppServices {
	sayYo: ServiceResolver<(to: string, from: string) => string>,
	sayHello: ServiceResolver<(to: string, from: string) => string>,
	myName: ServiceResolver<() => string>,
	myNumber: ServiceResolver<number>
}

// Here is an existing function we want to add to the AppServices.
function sayYo(to: string, from: string) {
	return `Yo ${to} its ${from}, how are you?`;
}

export const configureServices: ConfigureServices<AppServices> = (builder) => ({
	// Use an existing function.
	sayYo: builder.scoped(services => sayYo),

	// Or declare the function inline.
	sayHello: builder.singleton(services => (to, from): string {
		return `Hello ${to} from ${from}`;
	}),

	// And even basic types
	myName: builder.singleton(services => 'Fred'),
	myNumber: builder.transiant(services => Math.random())
});

// Create a service provider
const serviceProvider = new ServiceProvider(configureServices);
let services = serviceProvider.services();

// Get the functions and strings we want.
const sayHello = services.sayHello();
const mySayYo = servies.sayYo();
const myName = services.myName();

// Call the functions (keep in mind this is all still typesafe).
sayHello('Steve', myName);
sayYo('Laura', myName);

```

When delcaring functions you can often resolve some function arguments from other depenencies.  In the example above we always want to greet
people as our own name (Fred), but we're still passing it each time in the above, given that myName is already a depenency, we can simplify
things by resolving that as part of the service resolution and returning functions only requiring the argments we don't already know:
```ts
export interface AppServices {
	sayYo: ServiceResolver<(to: string) => string>, // Notice we no longer require the argument from: string
	sayHello: ServiceResolver<(to: string) => string>, // Notice we no longer require the argument from: string
	myName: ServiceResolver<() => string>,
	myNumber: ServiceResolver<number>
}

// Here is an existing function we want to use in the AppServices.
function sayYo(to: string, from: string) {
	return `Yo ${to} its ${from}, how are you?`;
}

export const configureServices: ConfigureServices<AppServices> = (builder) => ({
	// Use an existing function.
	sayYo: builder.scoped(services => (to): string {
		return sayYo(to, servies.myName());
	}),

	// Or declare the function inline.
	sayHello: builder.singleton(services => (to): string {
		return `Hello ${to} from ${services.myName()}`;
	}),

	// And even basic types
	myName: builder.singleton(services => 'Fred'),
	myNumber: builder.transiant(services => Math.random())
});

// Create a service provider
const serviceProvider = new ServiceProvider(configureServices);
let services = serviceProvider.services();

// Get the functions and strings we want.
const sayHello = services.sayHello();
const mySayYo = servies.sayYo();

// Call the functions (keep in mind this is all still typesafe, and now knows we no longer need to pass from).
sayHello('Steve');
sayYo('Laura');
```

You can use the same technique to make arguments optional:

```ts
export interface AppServices {
	sayYo: ServiceResolver<(to: string, from?: string) => string>, // Notice from is now optional: from? string
}

// Here is an existing function we want to use in the AppServices.
function sayYo(to: string, from: string) {
	return `Yo ${to} its ${from}, how are you?`;
}


export const configureServices: ConfigureServices<AppServices> = (builder) => ({
	// Use service.myName() as a default if we don't get from passed in.
	sayYo: builder.singleton(services => (to, from): string {
		if (!from) {
			from = services.myName();
		}

		return sayYo(to, from);
	})
});

// Create a service provider
const serviceProvider = new ServiceProvider(configureServices);
let services = serviceProvider.services();

// Get the functions and strings we want.
const sayYo = services.sayYo();

// Call the functions (still typesafe...)
sayYo('Steve'); // Returns: Yo Steve its Fred, how are you?
sayYo('Laura', 'Bob); // Returns: Yo Steve its Bob, how are you?
```

### Can I seperate my dependencies out into sepreate files and types?

Yes you can seperate out your depenencies out into the most appropriate parts of your application and then compose them back into a single place
using standard Typescript features.

```ts
// AuthenticationServices.ts
export interface AuthenticationServices {
	cache: ServiceResolver<CacheService>,
	authentication: ServiceResolver<AuthenticationService>
}

export const configureAuthenticationServices: ConfigureServices<AuthenticationServices> = (builder) => ({
	cache: builder.scoped(services => new CacheService()),
	authentication: builder.scoped(services => new HttpAuthenticationService('/your/endpoint/here'))
});
```

```ts
// PasswordServices.ts
export interface PasswordServices {
	passwordOptions: ServiceResolver<PasswordOptions>(),
    passwordValidation: ServiceResolver<PasswordValidation>
}

export const configurePasswordServices: ConfigureServices<CoreServices> = (builder) => ({
	passwordOptions: builder.singleton(services => { requiredLength: 6, requireUppercase: true, requireNumber: false }),
	passwordValidation: builder.scoped(services => new PasswordValidation(services.passwordOptions))
});
```

```ts
// configureServices.ts
import { AuthenticationServices, configureAuthenticationServices } from './AuthenticationServices'
import { PasswordServices, configurePasswordServices } from './PasswordServices'

export interface AppServices extends AuthenticationServices, PasswordServices {
	// You can even add additional services here too
	animal: ServiceResolver<Animal>(),
	color: ServiceResolver<Color>()
}

export const configureServices: ConfigureServices<AppServices> = (builder) => ({
	// Configure the services we are combining
	...configureAuthenticationServices(builder),
	...configurePasswordServices(builder),

	// And our own services
	animal: builder.scoped(services => new Dog(services.color()),
	color: builder.singleton(services => new Red())
});
```

You can then refer only to the parts of the AppService you care about when consuming the services, for example:
```ts
import { withInjectedProps } from 'inject-typesafe-react';
import { PasswordServices } from './PasswordServices'

interface MyComponentProps {
	passwordValidation: PasswordValidation
}

const _ChangePassword = (props: MyComponentProps) => {
	return (
		<div>
			<RestOfYourComponent />
		</div>
		);
};

export const MyComponent = withInjectedProps<MyComponentProps, PasswordServices>(services => ({
    passwordValidation: services.passwordValidation()
}))(ChangePassword);
```

### Can I use inject-typesafe with Javascript?

Yes you can use inject-typesafe with Javascript, just keep in mind that you won't get the same typesafety you get with Typescript just down to the
differences in the languages.  Heres an example of usage in Javascript:

```js
export const configureServices = (builder) => ({
	animal: builder.scoped(services => new Dog(services.color()),
	color: builder.singleton(services => new Red())
});

var inject = require('inject-typesafe');


const serviceProvider = new inject.ServiceProvider(configureServices);
let services = serviceProvider.services();

let myAnimal = services.animal();
// myAnimal is now resolved and initalised as new Dog(new Red())
```

### Can I store my Redux store as a dependency?

Yes, you can store your redux store (or any other extenal object/value) as a dependency by using it in configureServices:

```ts
// In your App.tsx 
// Create your Redux store as normal
const store = configureStore();

// Create a ServiceProvider
const configureServices = createConfigureServices(store);
const serviceProvider = new ServiceProvider(configureServices);
```

```ts
// configureServices.ts

export interface AppServices {
	store: ServiceResolver<Store<AppState>>,

	// Declare the rest of your services
}

export function createConfigureServices(store: Store<AppState>) : ConfigureServices<AppServices> {
	return (builder) => ({
		store: builder.singleton(services => store),

		// Configure the rest of your services using services.store() if you want access to the store
	});
};
```

### What is the difference between scoped, singleton, and transiant.

When configuring your services you can decide the lifetime of the resolved services.

There are three options which are pretty common across all dependency injection frameworks, including this one:
1. Singleton - The first time this service is resolved the value is cached and all subsequent requests always return the same instance.
2. Scoped - The first time this service is resolved the value is temproarily cached and reused within the scope of the call (see What is a Scope?).
In practice this means when resolving an object everything that accepts an object if this type in the dependency tree gets the same instance.
3. Transiant - Every time this service is resolved a new instance is created, no cache or resuse takes place.

If all of this is a little confusing, don't worry in practice, you will use Singleton when the value same value is used everywhere,
Transiant when you want a unqiue item instance each time, and Scoped for everything else (it is the most commonly used).

You decide the lifetime of your services when you are declaring them in configureServices by using one of:
1. builder.singleton(services => your_service_here)
2. builder.scoped(services => your_service_here)
3. builder.transiant(services => your_service_here)

Example:

```ts
export inteface AppServices {
	sameEveryTime: number,
	sameWithinScope: number,
	differentEveryTime: number,
}

export const configureServices: ConfigureServices<AppServices> = (builder) => ({
	// Will use the same value everytime its resolved by the ServiceProvider.
	sameEveryTime: builder.singleton(services => Math.random()),

	// Will be the same when resolved within the same scope.
	sameWithinScope: builder.singleton(services => Math.random()),

	// Will be different every time
	differentEveryTime: builder.singleton(services => Math.random()),
});
```

Although the scope is harder to explain than singleton or transiant,aAs a rule of thumb, if you are not sure which you need while you are
getting started, go with builder.scoped() and everything will likely behave as you expect.  You will probably use builder.scoped() more than
the other two, and only use those when you know you need their particular behaviour.

Note that a singleton is a singleton only within the scope of a ServiceProvider.  If you create multiple ServiceProviders, each will have their own
cache of singletons which will be seperate from one another.

### What is Scope

For dependency injection the Scope is the lifetime for scoped dependencies (those creatd with builder.scoped()
see "What is the difference between scoped, singleton, and transiant.").

We often manage the scope for you, for example in inject-typesafe-react any call to useInjected() or withInjectedProps() will create a new
scope containing just the services resolved during that call.

You can create a scope yourself if required using ServiceProvider.createScope().

```ts
// Our service provider.
const serviceProvider = new ServiceProvider(configureServices);

// Create a specific seperate scope.
let scope = serviceProvider.createScope();
```

Each ServiceProvider contains its own scope by default, so everytime you do new ServiceProvider(configureServices) you are actually also
creating a scope, you don't need to seperately call createScope().  However if you have a long lifed ServiceProvider (e.g. such as one
you've put into the react context) then calling createScope() is helpful to manage the lifecycle of objects that shouldn't be singletons.

### Can you give me the code for the classes used in the Examples?

Here are the Animal, Color, Dog, and Red, classes we used in our examples in case it helps:
```ts
interface Animal { function describe(): string; }
interface Color { name: string, hex: string; }

class Dog implements Animal {
	private readonly color: Color;

	constructor(color: Color) {
		this.color = color;
	}

	function describe() : string {
		return `Woof, woof, I am a ${this.color.name} dog`;
	}
}

class Red implements Color {
	name: 'red',
	hex: '#ff0000';
}

// And a few more for fun if you are playing around with the examples and want to try changing dependencies in configureServices.

class Cat implements Animal {
	private readonly color: Color;

	constructor(color: Color) {
		this.color = color;
	}

	function describe() : string {
		return `Meow, meow, I am a ${this.color.name} cat, purrr.`;
	}
}

class Green implements Color {
	name: 'green',
	hex: '#00ff00';
}

class Blue implements Color {
	name: 'blue',
	hex: '#0000ff';
}

```


## License

Licensed under the MIT license.



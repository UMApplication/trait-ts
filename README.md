# Traits(Mixin) for Typescript
## Already merged into **UMA**pplication

## Why Traits(Mixin)

Trait is a good replacement of "Extending Multiple Classes".

In fact, Many modern OOP languages already implemented this feature as a "native" part or providing a guideline for developers who need this.

Typescript also provide a [example](https://www.typescriptlang.org/docs/handbook/mixins.html) shows how to do this in typescript.

Let we talk about those languages who are not implemented natively.

There are two ways to simulate trait/mixin like "real" native implementations.

**1. Create trait using both class/structure and interface, create its instance while creating parent class instance**

This way used by Golang and Java.

Usually, developer need to create class/structure for actual implementation and interface for extending.

Here is a sample code snippets in java:

```java
interface Plant {
    String getColor();

    void setColor(String val);
}

interface Food {
    String getTaste();

    void setTaste(String val);
}

class FoodImp implements Food {
    private String taste;

    @Override
    public String getTaste() {
        return taste;
    }

    @Override
    public void setTaste(String val) {
        taste = val;
    }

}

class PlantImpl implements Plant {
    private String color;

    @Override
    public String getColor() {
        return color;
    }

    @Override
    public void setColor(String val) {
        color = val;
    }
}

class Pair<T, U> {
    private T left;
    private U right;

    public Pair(T left, U right) {
        this.left = left;
        this.right = right;
    }

    public T getLeft() {
        return left;
    }
    public U getRight() {
        return right;
    }

    public static <T, U> Pair<T, U> of(T left, U right) {
        return new Pair<T, U>(left, right);
    }
}

class MixinProxy implements InvocationHandler {

    private final Map<String, Object> delegates;
    public MixinProxy(Pair<?, Class<?>> ...pairs) {
        delegates = new HashMap<>();
        for (Pair<?, Class<?>> pair: pairs) {
            for (Method method: pair.getRight().getMethods()) {
                String methodName = method.getName();
                if (!delegates.containsKey(methodName)) {
                    delegates.put(methodName, pair.getLeft());
                }
            }
        }
    }

    @Override
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        Object delegate = delegates.get(method.getName());
        return method.invoke(delegate, args);
    }

    public static Object newInstance(Pair<?, Class<?>> ...pairs) {
        Set<Class<?>> interfaces = Arrays.stream(pairs).map(pair -> pair.getRight()).collect(Collectors.toSet());
        return Proxy.newProxyInstance(pairs[0].getLeft().getClass().getClassLoader(), interfaces.toArray(new Class<?>[pairs.length]), new MixinProxy(pairs));
    }
}

public class Test {
    public static void main(String[] args) {
        Object vegetable = MixinProxy.newInstance(
            Pair.of(new FoodImp(), Food.class),
            Pair.of(new PlantImpl(), Plant.class)
        );

        Food food = (Food) vegetable;
        Plant plant = (Plant) vegetable;

        food.setTaste("good");
        plant.setColor("green");

        System.out.println("Taste is " + food.getTaste());
        System.out.println("Color is " + plant.getColor());
    }

```

The problem of above is "Properties" cannot be shared between Traits.

**2. Merge trait symbols into target class**

This way is only work on script languages or may need some 'Magic'.

Not very common in non-script languages.

Here is a sample in Typescript

```typescript
// Each mixin is a traditional ES class
class Jumpable {
  jump() {}
}
 
class Duckable {
  duck() {}
}
 
// Including the base
class Sprite {
  x = 0;
  y = 0;
}
 
// Then you create an interface which merges
// the expected mixins with the same name as your base
interface Sprite extends Jumpable, Duckable {}
// Apply the mixins into the base class via
// the JS at runtime
applyMixins(Sprite, [Jumpable, Duckable]);
 
let player = new Sprite();
player.jump();
console.log(player.x, player.y);
 
// This can live anywhere in your codebase:
function applyMixins(derivedCtor: any, constructors: any[]) {
  constructors.forEach((baseCtor) => {
    Object.getOwnPropertyNames(baseCtor.prototype).forEach((name) => {
      Object.defineProperty(
        derivedCtor.prototype,
        name,
        Object.getOwnPropertyDescriptor(baseCtor.prototype, name) ||
          Object.create(null)
      );
    });
  });
}
```

We strongly recommend not Defining interface and class using same name although they are pointing to one same "Class".

And also, this solution is not so Typescript.

## How to install

Install using yarn

> yarn add git+https://git.services.m2d.in/technology/information/laboratory/umapplication/traits/typescript.git

or using npm

> npm install git+https://git.services.m2d.in/technology/information/laboratory/umapplication/traits/typescript.git

and import in your project

## How to use

UMA-Traits is extremely easy to use.

Here is an example case, and all following tutorials are basing on this case:

```typescript

class Human {

  constructor(
    public Name: string
  ) { }

  public Speak() {
    console.log('Human can speak');
  }
}

class Designer {
  public Draw() {
    console.log('Designer can draw');
  }
}

class Developer {
  public Coding() {
    console.log('Developer can coding');
  }
}

```

Here we got 2 roles: Designer & Developer and a base class: Human, it is impossible to have multiple of them in one single person without some Magic.

Now, with UMA-Traits, we change simply do that:

```typescript
class Clarkson extends (Traits.Basing(Human).With(Designer, Developer)) {
}

const clarksonInstance = new Clarkson();

// Now Clarkson can get these things done
clarksonInstance.Speak();
clarksonInstance.Draw();
clarksonInstance.Coding();

```

### Limitation to traits

You should noticed that only Basing class can have a **Constructor with Arguments**.

The actual execution order of constructors in above case is like:

```typescript
function Clarkson(...args: any[]) {

  Human(...args);
  Designer();
  Developer();

}
```

### Determine if a class extended a trait

Keyword "instanceof" is still worked for base class but not traits.

Here is the real situation you are facing:

```typescript

(clarksonInstance) instanceof Human; // true
(clarksonInstance) instanceof Designer; // false
(clarksonInstance) instanceof Developer; // false

```

Using helper methods can easily do this better and even better than "instanceof".

```typescript
Traits.Having(Clarkson, Human); // true
Traits.Having(clarksonInstance, Human); // true

Traits.Having(Clarkson, Designer); // true
Traits.Having(clarksonInstance, Designer); // true

Traits.Having(Clarkson, Developer); // true
Traits.Having(clarksonInstance, Developer); // true

```

And also worked with class which using Clarkson as base class

```typescript
class LittleClarkson extends Clarkson {
}

Traits.Having(LittleClarkson, Human); // true
Traits.Having(LittleClarkson, Designer); // true
Traits.Having(LittleClarkson, Developer); // true

```

## Difference to UMApplication.Traits

Traits in UMA is just a wrapper of this project, no different other than that.

## About issues

Since we are no longer use github as our major repo platform, processing of issues on github may be procrastinated, please pay a patience and we are sorry about that.
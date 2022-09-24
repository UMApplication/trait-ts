
export type Constructor<T = any> = new (...args: any[]) => T;

export type Traitable<T = any> = new () => T;

export type IntersectClass<T extends any[]> =
  T extends [infer A extends Traitable] ? A :
  T extends [infer A extends Traitable, ...infer B] ? A & IntersectClass<B> :
  never;

export type IntersectInstance<T extends any[]> =
  T extends [infer A extends Traitable] ? InstanceType<A> :
  T extends [infer A extends Traitable, ...infer B] ? InstanceType<A> & IntersectInstance<B> :
  never;

export class Traits {

  private static __IntermediateClassID = 0;
  private static __IntermediateClasses: Record<number, Constructor> = {};
  private static __IntermediateClassInjections: Record<number, (Constructor)[]> = {};

  public static Basing<T extends Constructor>(baseClass: T) {
    class intermediateClass extends baseClass {

      public static readonly IntermediateClassID: number = Traits.__IntermediateClassID++;

      constructor(...args: any[]) {
        super(...args);
        // Instantiate traits and copy members
        for (const injectedTrait of Traits.__IntermediateClassInjections[intermediateClass.IntermediateClassID].slice(1)) {
          const injectedInstance = new injectedTrait();
          const injectedInstanceMemberNames = Object.getOwnPropertyNames(injectedInstance);
          for (const injectedInstanceMemberName of injectedInstanceMemberNames) {
            if (injectedInstanceMemberName in this) throw new Error(`Class member ${injectedInstanceMemberName} already exists or conflict with another trait`);
            Object.defineProperty(this, injectedInstanceMemberName, Object.getOwnPropertyDescriptor(injectedInstance, injectedInstanceMemberName)!);
          }
        }
      }

      public static With<U extends Traitable[]>(...traits: U): IntersectClass<U> & T & Constructor<IntersectInstance<U> & InstanceType<T>> {

        Traits.__IntermediateClassInjections[intermediateClass.IntermediateClassID].push(...traits);

        const defaultStaticMemberNames = Object.getOwnPropertyNames(this);

        for (const trait of traits) {
          // Copy static members to temporary class
          const staticMemberNames = Object.getOwnPropertyNames(trait).filter(v => !defaultStaticMemberNames.includes(v));
          for (const staticMemberName of staticMemberNames) {
            if (staticMemberName in this) throw new Error(`Static member ${staticMemberName} already exists or conflict with another trait`);
            Object.defineProperty(this, staticMemberName, Object.getOwnPropertyDescriptor(trait, staticMemberName)!);
          }

          // Copy instance members to temporary class
          const defaultClassMemberNames = Object.getOwnPropertyNames(this.prototype);
          const classMemberNames = Object.getOwnPropertyNames(trait.prototype).filter(v => !defaultClassMemberNames.includes(v));
          for (const classMemberName of classMemberNames) {
            if (classMemberName in this.prototype) throw new Error(`Class member ${classMemberName} already exists or conflict with another trait`);
            Object.defineProperty(this.prototype, classMemberName, Object.getOwnPropertyDescriptor(trait.prototype, classMemberName)!);
          }
        }
        return this as any;
      }
    }

    Traits.__IntermediateClassInjections[intermediateClass.IntermediateClassID] = [baseClass];
    Traits.__IntermediateClasses[intermediateClass.IntermediateClassID] = intermediateClass;
    return intermediateClass;
  }

  public static Having<T extends Constructor>(refClass: object, testClass: T): refClass is T {
    // Convert to class
    if (!(refClass instanceof Function)) return this.Having(Object.getPrototypeOf(refClass).constructor, testClass);

    // Search property chain first
    if (this.IsSubclass(refClass as Constructor, testClass)) return true;

    // No other options if refClass is not extending from a intermediate class
    if (!('IntermediateClassID' in refClass) || this.IsSubclass(Traits.__IntermediateClasses[refClass['IntermediateClassID']] as Constructor, testClass)) return false;

    return Traits.__IntermediateClassInjections[refClass['IntermediateClassID']].includes(testClass);
  }

  protected static IsSubclass(refClass: Constructor, maybeSuperClass: Constructor): boolean {
    // Search property chain first
    let searchClass = Object.getPrototypeOf(refClass);
    while (searchClass) {
      if (searchClass === maybeSuperClass) return true;
      searchClass = Object.getPrototypeOf(searchClass);
    }
    return false;
  }
}

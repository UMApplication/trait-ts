export declare type Constructor<T = any> = new (...args: any[]) => T;
export declare type Traitable<T = any> = new () => T;
export declare type IntersectClass<T extends any[]> = T extends [infer A extends Traitable] ? A : T extends [infer A extends Traitable, ...infer B] ? A & IntersectClass<B> : never;
export declare type IntersectInstance<T extends any[]> = T extends [infer A extends Traitable] ? InstanceType<A> : T extends [infer A extends Traitable, ...infer B] ? InstanceType<A> & IntersectInstance<B> : never;
export declare class Traits {
    private static __IntermediateClassID;
    private static __IntermediateClasses;
    private static __IntermediateClassInjections;
    static Basing<T extends Constructor>(baseClass: T): {
        new (...args: any[]): {
            [x: string]: any;
        };
        readonly IntermediateClassID: number;
        With<U extends Traitable<any>[]>(...traits: U): IntersectClass<U> & T & Constructor<IntersectInstance<U> & InstanceType<T>>;
    } & T;
    static Having<T extends Constructor>(refClass: object, testClass: T): refClass is T;
    protected static IsSubclass(refClass: Constructor, maybeSuperClass: Constructor): boolean;
}
//# sourceMappingURL=Traits.d.ts.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Traits = void 0;
class Traits {
    static Basing(baseClass) {
        class intermediateClass extends baseClass {
            constructor(...args) {
                super(...args);
                // Instantiate traits and copy members
                for (const injectedTrait of Traits.__IntermediateClassInjections[intermediateClass.IntermediateClassID].slice(1)) {
                    const injectedInstance = new injectedTrait();
                    const injectedInstanceMemberNames = Object.getOwnPropertyNames(injectedInstance);
                    for (const injectedInstanceMemberName of injectedInstanceMemberNames) {
                        if (injectedInstanceMemberName in this)
                            throw new Error(`Class member ${injectedInstanceMemberName} already exists or conflict with another trait`);
                        Object.defineProperty(this, injectedInstanceMemberName, Object.getOwnPropertyDescriptor(injectedInstance, injectedInstanceMemberName));
                    }
                }
            }
            static With(...traits) {
                Traits.__IntermediateClassInjections[intermediateClass.IntermediateClassID].push(...traits);
                const defaultStaticMemberNames = Object.getOwnPropertyNames(this);
                for (const trait of traits) {
                    // Copy static members to temporary class
                    const staticMemberNames = Object.getOwnPropertyNames(trait).filter(v => !defaultStaticMemberNames.includes(v));
                    for (const staticMemberName of staticMemberNames) {
                        if (staticMemberName in this)
                            throw new Error(`Static member ${staticMemberName} already exists or conflict with another trait`);
                        Object.defineProperty(this, staticMemberName, Object.getOwnPropertyDescriptor(trait, staticMemberName));
                    }
                    // Copy instance members to temporary class
                    const defaultClassMemberNames = Object.getOwnPropertyNames(this.prototype);
                    const classMemberNames = Object.getOwnPropertyNames(trait.prototype).filter(v => !defaultClassMemberNames.includes(v));
                    for (const classMemberName of classMemberNames) {
                        if (classMemberName in this.prototype)
                            throw new Error(`Class member ${classMemberName} already exists or conflict with another trait`);
                        Object.defineProperty(this.prototype, classMemberName, Object.getOwnPropertyDescriptor(trait.prototype, classMemberName));
                    }
                }
                return this;
            }
        }
        intermediateClass.IntermediateClassID = Traits.__IntermediateClassID++;
        Traits.__IntermediateClassInjections[intermediateClass.IntermediateClassID] = [baseClass];
        Traits.__IntermediateClasses[intermediateClass.IntermediateClassID] = intermediateClass;
        return intermediateClass;
    }
    static Having(refClass, testClass) {
        // Convert to class
        if (!(refClass instanceof Function))
            return this.Having(Object.getPrototypeOf(refClass).constructor, testClass);
        // Search property chain first
        if (this.IsSubclass(refClass, testClass))
            return true;
        // No other options if refClass is not extending from a intermediate class
        if (!('IntermediateClassID' in refClass) || this.IsSubclass(Traits.__IntermediateClasses[refClass['IntermediateClassID']], testClass))
            return false;
        return Traits.__IntermediateClassInjections[refClass['IntermediateClassID']].includes(testClass);
    }
    static IsSubclass(refClass, maybeSuperClass) {
        // Search property chain first
        let searchClass = Object.getPrototypeOf(refClass);
        while (searchClass) {
            if (searchClass === maybeSuperClass)
                return true;
            searchClass = Object.getPrototypeOf(searchClass);
        }
        return false;
    }
}
exports.Traits = Traits;
Traits.__IntermediateClassID = 0;
Traits.__IntermediateClasses = {};
Traits.__IntermediateClassInjections = {};
//# sourceMappingURL=Traits.js.map
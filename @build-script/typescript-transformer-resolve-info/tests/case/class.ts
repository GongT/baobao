import { Interface, InterfaceWithClass } from '../decl/interface';

export let ifaceObj: Interface;
export interface SomeInterface extends InterfaceWithClass {}

export class SomeClass extends InterfaceWithClass {}
export let obj: InterfaceWithClass = new InterfaceWithClass();

import type { HelloParams } from '../types/hello.model.js';

export class HelloService {
    sayHello(params: HelloParams): string {
        return `Hello, ${params.name}!`;
    }
}

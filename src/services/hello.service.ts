import type { HelloParams } from '../types/hello.type';

export class HelloService {
    sayHello(params: HelloParams): string {
        return `Hello, ${params.name}!`;
    }
}

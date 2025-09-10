import type { Request, Response } from 'express';
import { HelloService } from '../services/hello.service';
import { sendBadRequest, sendSuccess } from '../utils/response.util';

export class HelloController {
    private helloService = new HelloService();

    sayHello = (req: Request, res: Response) => {
        const name = req.params.name;

        if (!name) {
            return sendBadRequest(res, ['Name parameter is required'], 'Missing name parameter.');
        }

        const message = this.helloService.sayHello({ name });
        return sendSuccess(res, { message }, 'Greeting generated successfully.', 201);
    };
}

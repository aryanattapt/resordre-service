import { Router } from 'express';
import { HelloController } from '../controllers/hello.controller';
import { sendMethodNotAllowed } from '../utils/response.util';

const router = Router();
const helloController = new HelloController();

router.route('/:name').get(helloController.sayHello).all((req, res) => sendMethodNotAllowed(res));

export default router;
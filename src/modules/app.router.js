import { globalErrorHandler } from '../utils/errorHandling.js';
import authRouter from './auth/auth.router.js';

const initApp = async (app, express) => {
  app.use(express.json());
  app.get('/', (req, res) => {
    return res.status(200).json({ message: 'welcome' });
  });
  app.use('/auth', authRouter);

  app.get('*', (req, res) => {
    res.status(500).json({ message: 'page NOT found..' });
  });
  app.use(globalErrorHandler);
};
export default initApp;

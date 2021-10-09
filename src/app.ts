import express, {Application} from 'express';
import balanco from './rotas/balanco';

const app: Application = express();

app.use(balanco);

export default app;
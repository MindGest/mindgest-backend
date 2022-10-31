import * as express from 'express';

//Error that shows up when route searched doesn't exist
export function notFound(req: express.Request, res: express.Response){ 
    res.status(404).send('Route does not exist')
}
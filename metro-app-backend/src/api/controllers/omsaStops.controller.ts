import * as omsaStopsService from '../../services/omsaStops.service';
import { Request, Response } from 'express';

export async function readOmsaStops(req: Request, res: Response) {
    const stops = await omsaStopsService.readOmsaStops();
    res.json(stops);
}

export async function searchOmsaStops(req: Request, res: Response) {
    const q = req.query.q as string;
    const results = await omsaStopsService.searchOmsaStops(q);
    res.json(results);
}

import * as stationsService from '../../services/stations.service';
import { Request, Response } from 'express';

export async function readStations(req: Request, res: Response) {
    const stations = await stationsService.readStations();
    res.json(stations);
};

export async function createStation(req: Request, res: Response) {
    const {name, line, address, lat, lng } = req.body;
    const newStation = await stationsService.createStation(name, line, address, lat, lng);
    res.status(201).json(newStation);
};

export async function updateStation(req: Request, res: Response) {
    const stationid = Number(req.params.id);
    const data = req.body;
    const updatedStation = await stationsService.updateStation(stationid, data);
    res.json(updatedStation);
};

export async function deleteStation(req: Request, res: Response) {
    const stationid = Number(req.params.id);
    const deletedStation = await stationsService.deleteStation(stationid);

    if (!deletedStation) {
        return res.status(404).json({ message: "Station not found" });
    }
    res.json({
        message: `Station ${deletedStation.name} deleted successfully`,
    });
};

export async function searchStations(req: Request, res: Response) {
    const q = req.query.q as string;
    const results = await stationsService.searchStations(q);
    res.json(results);
}
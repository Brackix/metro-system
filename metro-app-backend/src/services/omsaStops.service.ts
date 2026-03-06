import prisma from "../config/prisma";

/**
 * Get all OMSA stops
 */
export async function readOmsaStops() {
    return await prisma.omsastops.findMany();
}

/**
 * Search OMSA stops by name, code, or corridor (case-insensitive)
 */
export async function searchOmsaStops(query: string) {
    return await prisma.omsastops.findMany({
        where: {
            OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { code: { contains: query, mode: 'insensitive' } },
                { corridor: { contains: query, mode: 'insensitive' } }
            ]
        }
    });
}

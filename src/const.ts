
export const config = {
    dataPath: "https://impfdashboard.de/static/data",
    metadataPath: "metadata.json",
    population: 83166711
};

export enum DataSource {
    VaccinationsTimeSeries = "germany_vaccinations_timeseries_v2",
    DeliveriesTimeSeries = "germany_deliveries_timeseries_v2",
}

declare var __BUILDINFO___: any;

export function getBuildInfo() {
    return __BUILDINFO___;
}

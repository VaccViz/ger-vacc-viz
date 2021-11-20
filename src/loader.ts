
import { parse, Parser } from 'csv-parse';
import moment from 'moment';
import { config, DataSource } from './const';
import { DeliveryTimeSeriesDataPoint, Metadata, VaccinationTimeSeriesDataPoint } from './model';
import { timeSeriesPointSort } from './util';

async function fetchCSVText(name: DataSource): Promise<string> {
    const res = await fetch(`${config.dataPath}/${name}.tsv`, {});
    const body = await res.text();
    return body;
}

async function fetchCSV(name: DataSource): Promise<Parser> {
    const csv = await fetchCSVText(name);
    return parse(csv, {
        delimiter: "\t",
        columns: true
    });
}

export async function fetchMetadata(): Promise<Metadata> {
    const res = await fetch(`${config.dataPath}/${config.metadataPath}`, {});
    const json = await res.json();
    return {
        vaccinationsLastUpdated: moment(json.vaccinationsLastUpdated).utcOffset(120),
        deliveryLastUpdated: moment(json.deliveryLastUpdated).utcOffset(120),
    }
}

export async function loadVaccinationTimeSeries(): Promise<VaccinationTimeSeriesDataPoint[]> {
    const parser = await fetchCSV(DataSource.VaccinationsTimeSeries);
    const timeSeries: VaccinationTimeSeriesDataPoint[] = [];
    for await (const record of parser) {
        timeSeries.push({
            date: moment(record["date"]),
            totalVaccineDoses: parseInt(record["dosen_kumulativ"]),
            peopleVaccinated: parseInt(record["dosen_differenz_zum_vortag"]),
            peopleFirstDose: parseInt(record["dosen_erst_differenz_zum_vortag"]),
            peopleSecondDose: parseInt(record["dosen_zweit_differenz_zum_vortag"]),
            peopleBoosterDose: parseInt(record["dosen_dritt_differenz_zum_vortag"]),
            totalPeopleFirstDose: parseInt(record["personen_erst_kumulativ"]),
            totalPeopleFullyVaccinated: parseInt(record["personen_voll_kumulativ"]),
            totalPeopleBoosterBose: parseInt(record["dosen_dritt_kumulativ"]),
        });
    }

    return timeSeries.sort(timeSeriesPointSort);
}

export async function loadDeliveryTimeSeries(): Promise<DeliveryTimeSeriesDataPoint[]> {
    const parser = await fetchCSV(DataSource.DeliveriesTimeSeries);
    const timeSeries: DeliveryTimeSeriesDataPoint[] = [];
    for await (const record of parser) {
        const date = moment(record["date"]);
        const vaccineName = record["impfstoff"];
        const dosesDelivered = parseInt(record["dosen"]);
        let dp = timeSeries.find(p => p.date.isSame(date));

        if(!dp) {
            dp = {
                date: date,
                dosesDelivered: 0,
                astraDosesDelivered: 0,
                comirnatyDosesDelivered: 0,
                johnsonDosesDelivered: 0,
                modernaDosesDelivered: 0
            };
            timeSeries.push(dp);
        }
        dp.dosesDelivered += dosesDelivered;
        switch(vaccineName) {
            case "comirnaty":
                dp.comirnatyDosesDelivered += dosesDelivered;
                break;
            case "astra":
                dp.astraDosesDelivered += dosesDelivered;
                break;
            case "johnson":
                dp.johnsonDosesDelivered += dosesDelivered;
                break;
            case "moderna":
                dp.modernaDosesDelivered += dosesDelivered;
                break;
        }
    }

    return timeSeries.sort(timeSeriesPointSort);
}
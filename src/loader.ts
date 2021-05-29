
import parse from 'csv-parse';
import moment from 'moment';
import { config, DataSource } from './const';
import { DeliveryTimeSeriesDataPoint, Metadata, VaccinationTimeSeriesDataPoint } from './model';
import { timeSeriesPointSort } from './util';

async function fetchCSVText(name: DataSource): Promise<string> {
    const res = await fetch(`${config.dataPath}/${name}.tsv`, {});
    const body = await res.text();
    return body;
}

async function fetchCSV(name: DataSource): Promise<parse.Parser> {
    const csv = await fetchCSVText(name);
    return parse(csv, { delimiter: "\t"});
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
        // Skip header:
        if(record[0] == "date") continue;

        timeSeries.push({
            date: moment(record[0]),
            totalVaccineDoses: parseInt(record[1]),
            peopleVaccinated: parseInt(record[2]),
            peopleFirstDose: parseInt(record[3]),
            peopleSecondDose: parseInt(record[4]),
            totalPeopleFirstDose: parseInt(record[8]),
            totalPeopleFullyVaccinated: parseInt(record[9])
        });
    }

    return timeSeries.sort(timeSeriesPointSort);
}

export async function loadDeliveryTimeSeries(): Promise<DeliveryTimeSeriesDataPoint[]> {
    const parser = await fetchCSV(DataSource.DeliveriesTimeSeries);
    const timeSeries: DeliveryTimeSeriesDataPoint[] = [];
    for await (const record of parser) {
        // Skip header:
        if(record[0] == "date") continue;
        const date = moment(record[0]);
        const vaccineName = record[1];
        const dosesDelivered = parseInt(record[3]);
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
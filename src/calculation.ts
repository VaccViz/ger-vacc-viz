import { average } from './util';
import { config } from './const';
import { BaseTimeSeriesDataPoint, CombinedTimeSeriesDataPoint, DeliveryTimeSeriesDataPoint, TimeSeries, TimeSeriesDataPoint, VaccinationTimeSeriesDataPoint, WeekSummary, RemainingVaccinationTime } from './model';

/**
 * Returns the oldest Date from both points or undefined.
 */
function minDate(point1: BaseTimeSeriesDataPoint | undefined, point2: BaseTimeSeriesDataPoint | undefined) {
    let result = point1?.date ?? point2?.date;

    if(point1 && point2) {
        if(point1.date.valueOf() < point2.date.valueOf()) {
            result = point1.date;
        } else {
            result = point2.date;
        }
    }
    return result;
}

export function combineTimeSeries(vaccTS: VaccinationTimeSeriesDataPoint[], deliveryTS: DeliveryTimeSeriesDataPoint[]) {
    const result: CombinedTimeSeriesDataPoint[] = [];

    let currentVacc = undefined;
    let currentDelivery = undefined;
    do {
        if(!currentVacc) {
            currentVacc = vaccTS.shift();
        }
        if(!currentDelivery) {
            currentDelivery = deliveryTS.shift();
        }
        const date = minDate(currentDelivery, currentVacc);
        if(date === undefined) {
            break;
        }

        const data: CombinedTimeSeriesDataPoint = {
            date: date,

            peopleFirstDose: 0,
            peopleSecondDose: 0,
            peopleVaccinated: 0,
            totalVaccineDoses: 0,
            totalPeopleFirstDose: 0,
            totalPeopleFullyVaccinated: 0,
            modernaDosesDelivered: 0,
            astraDosesDelivered: 0,
            comirnatyDosesDelivered: 0,
            johnsonDosesDelivered: 0,

            dosesDelivered: 0
        };

        if(currentVacc?.date.valueOf() === date.valueOf()) {
            data.peopleFirstDose = currentVacc.peopleFirstDose,
            data.peopleSecondDose = currentVacc.peopleSecondDose,
            data.totalVaccineDoses = currentVacc.totalVaccineDoses,
            data.peopleVaccinated = currentVacc.peopleVaccinated;
            data.totalPeopleFirstDose = currentVacc.totalPeopleFirstDose,
            data.totalPeopleFullyVaccinated = currentVacc.totalPeopleFullyVaccinated,
            currentVacc = null;
        }
        if(currentDelivery?.date.valueOf() === date.valueOf()) {
            data.dosesDelivered = currentDelivery.dosesDelivered;
            data.astraDosesDelivered = currentDelivery.astraDosesDelivered;
            data.comirnatyDosesDelivered = currentDelivery.comirnatyDosesDelivered;
            data.johnsonDosesDelivered = currentDelivery.johnsonDosesDelivered;
            data.modernaDosesDelivered = currentDelivery.modernaDosesDelivered;
            currentDelivery = null;
        }
        result.push(data);

    } while(true);

    return result;
}

export function calculateAverages(input: CombinedTimeSeriesDataPoint[]): TimeSeries {
    const result: TimeSeries = [];
    let totalDosesDelivered = 0;

    for (const [key, value] of input.entries()) {
        totalDosesDelivered += value.dosesDelivered;
        result.push({
            ...value,
            totalDosesDelivered: totalDosesDelivered,
            averageDoses: calcAverageField(input, key, t => t.peopleVaccinated),
            averageFirstDoses: calcAverageField(input, key, t => t.peopleFirstDose),
            averageSecondDoses: calcAverageField(input, key, t => t.peopleSecondDose),
            dosesAvailable: totalDosesDelivered - value.totalVaccineDoses
        });
    }

    return result;
}

function calcAverageField(input: CombinedTimeSeriesDataPoint[], i: number, selector: (t: CombinedTimeSeriesDataPoint) => number) {
    const i0 = i > 6 ? i - 6 : 0;
    const last7Days = input.map(selector).slice(i0, i+1);
    return average(last7Days);
}

export function calculateWeeklyData(dailyTimeSeries: TimeSeries): WeekSummary[] {
    let result: WeekSummary[] = [];
    let currentWeek: WeekSummary | null = null;
    for(const day of dailyTimeSeries) {
        if(!currentWeek || !day.date.isSame(currentWeek.date, 'W')) {
            currentWeek = {
                date: day.date,
                peopleFirstDose: 0,
                peopleSecondDose: 0,
                peopleVaccinated: 0,
                dosesDelivered: 0,
                astraDosesDelivered: 0,
                comirnatyDosesDelired: 0,
                johnsonDosesDelivered: 0,
                modernaDosesDelivered: 0
            };
            result.push(currentWeek);
        }
        currentWeek.peopleFirstDose += day.peopleFirstDose;
        currentWeek.peopleSecondDose += day.peopleSecondDose;
        currentWeek.dosesDelivered += day.dosesDelivered;
        currentWeek.peopleVaccinated += day.peopleVaccinated;
        currentWeek.astraDosesDelivered += day.astraDosesDelivered;
        currentWeek.comirnatyDosesDelired += day.comirnatyDosesDelivered;
        currentWeek.johnsonDosesDelivered += day.johnsonDosesDelivered;
        currentWeek.modernaDosesDelivered += day.modernaDosesDelivered;
    }

    // show only full weeks:
    return getCurrentData(dailyTimeSeries).date.day() == 0 ?
    result : result.slice(0,result.length-1);
}

export function getCurrentData(ts: TimeSeries) {
    return  ts.slice(-1)[0];
}

export function calculateTable(d: TimeSeriesDataPoint): RemainingVaccinationTime[] {
    const population = config.population;

    const secondDoseMeaningful = !(d.averageSecondDoses*0.9 > d.averageFirstDoses);

    const result = [
        {
            title: "70% first dose administered",
            subtitle: "based on first dose 7-day average and remaining first doses",
            days: (population  * 0.7  - d.totalPeopleFirstDose) / d.averageFirstDoses,
            meaningful: true
        },
        {
            title: "100% first dose administered",
            subtitle: "based on the first dose 7-day average and remaining first doses",
            days: (population - d.totalPeopleFirstDose) / d.averageFirstDoses,
            meaningful: secondDoseMeaningful
        },
        {
            title: "70% fully vaccinated",
            subtitle: "based on the second dose 7-day average and remaining second doses",
            // TODO: this unnecessary imprecisely because it does not take vaccines into account which requires only one dose
            days: (population * 0.7 - d.totalPeopleFullyVaccinated) / d.averageSecondDoses,
            meaningful: secondDoseMeaningful
        },
        {
            title: "Fully vaccinated",
            subtitle: "based on the 7-day average of total doses and remaining overall doses",
            // TODO: this unnecessary imprecisely because it does not take vaccines into account which requires only one dose
            days: (population * 2 - d.totalVaccineDoses) / d.averageDoses,
            meaningful: true
        },
        {
            title: "Fully vaccinated",
            subtitle: "based on the second dose 7-day average and remaining second doses",
            days: (population - d.totalPeopleFullyVaccinated) / d.averageSecondDoses,
            meaningful: secondDoseMeaningful
        },
    ];
    return result;
}

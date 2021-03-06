import { ChartDataset } from 'chart.js';
import moment from 'moment';
import { ChartProps } from './chart';
import { config } from './const';
import { Metadata, TimeSeries, WeekSummary } from './model';

enum ChartColors {
    Blue = "25, 130, 196",
    DarkRed = "143, 0, 5",
    Red = "255, 89, 94",
    Yellow = "255, 202, 58",
    Green = "138, 201, 38",
    Purple = "106, 76, 147",
}

function chartColor(c: ChartColors) {
    return {
        borderColor: `rgba(${c}, 1)`,
        backgroundColor: `rgba(${c}, 0.4)`,
    }
}

const tsLabels = (ts: TimeSeries) => ts.map(t => moment(t.date).format("ddd, MMM DD"));

function cLineChart(label: string, data: number[], color: ChartColors): ChartDataset {
    return {
        label,
        data,
        ...chartColor(color),
        fill: false,
        tension: 0.4,
        type: 'line'
    };
}

function lineChart(label: string, data: number[], color: ChartColors): ChartDataset {
    return {
        label,
        data,
        ...chartColor(color),
        type: 'line'
    };
}

function barChart(label: string, data: number[], color: ChartColors): ChartDataset {
    return {
        label,
        data,
        ...chartColor(color),
    }
}

export function getVaccChartConfig(ts: TimeSeries): ChartProps {
    const datasets: ChartDataset[] = [
        cLineChart("7-day Average Vaccinations", ts.map(t => t.averageDoses), ChartColors.Purple),
        cLineChart("7-day Average First Dose", ts.map(t => t.averageFirstDoses), ChartColors.Blue),
        cLineChart("7-day Average Second Dose", ts.map(t => t.averageSecondDoses), ChartColors.Green),
        cLineChart("7-day Average Booster Dose", ts.map(t => t.averageBoosterDoses), ChartColors.Red),
        barChart("Daily Vaccinations", ts.map(t => t.peopleVaccinated), ChartColors.Yellow),
    ];

    return {
        title: "Vaccinations",
        labels: tsLabels(ts),
        yTitle: "Number of Vaccinations",
        datasets
    };
}

export function getDosesChartConfig(ts: TimeSeries, metadata: Metadata) {
    const datasets: ChartDataset[] = [
        cLineChart("Available Doses", ts.map(t => t.dosesAvailable), ChartColors.DarkRed),
        barChart("Daily Deliveries", ts.map(t => t.dosesDelivered), ChartColors.Red),
    ];

    return {
        title: "Deliveries of Doses",
        remark: `Deliveries will be updated on Mondays only. The last update was ${metadata.deliveryLastUpdated.fromNow()}.`,
        labels: tsLabels(ts),
        yTitle: "Number of Doses",
        datasets
    };
}


export function getWeeklyChartConfig(ws: WeekSummary[]) {
    const datasets: ChartDataset[] = [
        lineChart("People Vaccinated", ws.map(t => t.peopleVaccinated), ChartColors.Purple),
        lineChart("First Dose", ws.map(t => t.peopleFirstDose), ChartColors.Blue),
        lineChart("Second Dose", ws.map(t => t.peopleSecondDose), ChartColors.Green),
        lineChart("Booster Dose", ws.map(t => t.peopleBoosterDose), ChartColors.Red),
        barChart("Doses Delivered", ws.map(t => t.dosesDelivered), ChartColors.Yellow),
    ];

    return {
        title: "Weekly Vaccinations and Deliveries",
        labels: ws.map(w => moment(w.date).format("W")),
        yTitle: "Number of Doses",
        xTitle: "ISO Week",
        datasets
    };
}

export function getBoosterChartConfig(ts: TimeSeries) {
    const boosterStart = moment(config.boosterStart);
    const oldPeriodStart = moment(boosterStart).subtract(6, 'months');
    const oldPeriodEnd = moment(ts.slice(-1)[0].date).subtract(6, 'months');
    const population = config.population;

    const tsAfterBooster = ts.filter(t => t.date.isSameOrAfter(boosterStart));
    const tsOldPeriod = ts.filter(t => t.date.isSameOrAfter(oldPeriodStart) && t.date.isSameOrBefore(oldPeriodEnd));
    const tsMerged = tsAfterBooster.map((t, i) => tsOldPeriod[i].totalPeopleFullyVaccinated - t.totalPeopleBoosterDose );

    const datasets: ChartDataset[] = [
        cLineChart(
            "People fully vaccinated 6 months before",
            tsOldPeriod
                .map(t => t.totalPeopleFullyVaccinated/population*100),
            ChartColors.Blue),
        cLineChart(
            "People who did received their booster dose",
            tsAfterBooster.map(t => t.totalPeopleBoosterDose/population*100),
            ChartColors.Green),
        cLineChart(
            "People who did not received their booster dose after 6 months, yet",
            tsMerged.map(t => t/population*100),
            ChartColors.Red),
    ];

    return {
        title: "Booster Progress",
        labels: tsLabels(tsAfterBooster),
        yTitle: "Proportion of the population (%)",
        datasets
    };
}

export function getEstimationChartConfig(ts: TimeSeries): ChartProps {
    const population = config.population;
    ts = ts.filter(p => p.date.isAfter(moment("2021-05-14"))) // was 05-01

    // TODO: Import from calculation?
    const datasets: ChartDataset[] = [
        cLineChart("80% first dose administered", ts.map(d => (population  * 0.8  - d.totalPeopleFirstDose) / d.averageFirstDoses), ChartColors.Purple),
        cLineChart("70% fully vaccinated", ts.map(d => (population * 0.7 - d.totalPeopleFullyVaccinated) / d.averageSecondDoses).map(d => d > 0 ? d : 0), ChartColors.Blue),
        cLineChart("80% fully vaccinated", ts.map(d => (population * 0.8 - d.totalPeopleFullyVaccinated) / d.averageSecondDoses), ChartColors.Green),
    ];

    return {
        title: "Remaining Vaccination Time Estimations",
        labels: tsLabels(ts),
        yTitle: "Days",
        datasets
    };
}


export function getWeeklyChartByVaccineConfig(ws: WeekSummary[]) {
    const datasets: ChartDataset[] = [
        barChart("BioNTech/Pfizer", ws.map(t => t.comirnatyDosesDelired), ChartColors.Purple),
        barChart("AstraZeneca", ws.map(t => t.astraDosesDelivered), ChartColors.Green),
        barChart("Moderna", ws.map(t => t.modernaDosesDelivered), ChartColors.Blue),
        barChart("Johnson & Johnson", ws.map(t => t.johnsonDosesDelivered), ChartColors.Red),
    ];

    return {
        title: "Weekly Vaccine Deliveries",
        labels: ws.map(w => moment(w.date).format("W")),
        yTitle: "Number of Doses",
        xTitle: "ISO Week",
        datasets
    };
}

export function getVaccRatioChartConfig(ts: TimeSeries): ChartProps {
    ts = ts.filter(p => p.date.isAfter(moment("2021-02-01")))
    const datasets: ChartDataset[] = [
        cLineChart("Ratio of Administered Doses on that Day",
            ts.map(t => t.peopleFirstDose / t.peopleSecondDose),
            ChartColors.Purple),

            cLineChart("Ratio on Weekly Average (Smoothed Ratio)",
            ts.map(t => t.averageFirstDoses / t.averageSecondDoses),
            ChartColors.Yellow),
    ];

    return {
        title: "Ratio of First to Second Dose Vaccinations",
        subtitle: "Number of people who received their first dose for every second dose administered.",
        labels: tsLabels(ts),
        yTitle: "Ratio",
        datasets
    };
}
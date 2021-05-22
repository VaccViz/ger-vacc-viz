import { ChartDataset } from 'chart.js';
import moment from 'moment';
import { ChartProps } from './chart';
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
        lineChart("First Dose", ws.map(t => t.peopleFirstDose), ChartColors.Green),
        lineChart("Second Dose", ws.map(t => t.peopleSecondDose), ChartColors.Blue),
        barChart("Doses Delivered", ws.map(t => t.dosesDelivered), ChartColors.Red),
    ];

    return {
        title: "Weekly Vaccinations and Deliveries",
        labels: ws.map(w => moment(w.date).format("W")),
        yTitle: "Number of Doses",
        xTitle: "ISO Week",
        datasets
    };
}

import { fetchMetadata, loadDeliveryTimeSeries, loadVaccinationTimeSeries } from './loader';
import { getCurrentData, calculateTable, combineTimeSeries, calculateAverages, calculateWeeklyData } from './calculation';
import { render } from './render';
import { getDosesChartConfig, getVaccChartConfig, getWeeklyChartConfig, getEstimationChartConfig, getWeeklyChartByVaccineConfig } from './chartConfigs';
import moment from 'moment';
import { getBuildInfo } from './const';
import { log } from './util';

async function main() {
    console.log("Build Info:",getBuildInfo());
    // Async load data
    const [
        lastUpdate,
        vaccinationsTimeSeries,
        deliveryTimeSeries
    ] = await Promise.all([
        fetchMetadata(),
        loadVaccinationTimeSeries(),
        loadDeliveryTimeSeries()
    ]);

    const combinedTimeSeries = combineTimeSeries(vaccinationsTimeSeries, deliveryTimeSeries);
    const timeSeries = calculateAverages(combinedTimeSeries);
    const weeklySeries = calculateWeeklyData(timeSeries);

    const d = getCurrentData(timeSeries);

    render({
        lastUpdate: lastUpdate,
        remainingVaccTime: calculateTable(d),
        chartConfigurations: [
            getVaccChartConfig(timeSeries),
            getDosesChartConfig(timeSeries, lastUpdate),
            getWeeklyChartConfig(weeklySeries),
            getEstimationChartConfig(timeSeries),
            getWeeklyChartByVaccineConfig(weeklySeries)
        ]
    });
}

function errorHandler(reason: any) {
    log("main failed.", reason);
    const content = document.getElementById("content");
    if (content) {
        const error = document.createElement("p");
        error.className = "error";
        error.innerText = "Sorry, an error occurred while loading data. Please come back later.";
        content.innerHTML = '';
        content.appendChild(error);
    }
}

function success() {
    const diff = moment().diff(startTime);
    log(`main finished after ${diff} ms.`);
}

const startTime = moment();
main()
    .then(() => success())
    .catch((reason) => errorHandler(reason));


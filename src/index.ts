import { fetchMetadata, loadDeliveryTimeSeries, loadVaccinationTimeSeries } from './loader';
import { getCurrentData, calculateTable, combineTimeSeries, calculateAverages, calculateWeeklyData, calculateProgressTable } from './calculation';
import { render } from './render';
import { getDosesChartConfig, getVaccChartConfig, getWeeklyChartConfig, getEstimationChartConfig, getWeeklyChartByVaccineConfig, getVaccRatioChartConfig, getBoosterChartConfig } from './chartConfigs';
import { getBuildInfo } from './const';
import { runAsync } from './util';

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
        vaccProgress: calculateProgressTable(d, timeSeries),
        remainingVaccTime: calculateTable(d),
        chartConfigurations: [
            getVaccChartConfig(timeSeries),
            getWeeklyChartConfig(weeklySeries),
            getBoosterChartConfig(timeSeries),
            getWeeklyChartByVaccineConfig(weeklySeries),
            getDosesChartConfig(timeSeries, lastUpdate),
            getEstimationChartConfig(timeSeries),
            getVaccRatioChartConfig(timeSeries)
        ]
    });
}

runAsync(main, "main");
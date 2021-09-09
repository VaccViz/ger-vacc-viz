import { fetchMetadata, loadDeliveryTimeSeries, loadVaccinationTimeSeries } from './loader';
import { getCurrentData, calculateTable, combineTimeSeries, calculateAverages, calculateWeeklyData } from './calculation';
import { render } from './render';
import { getDosesChartConfig, getVaccChartConfig, getWeeklyChartConfig, getEstimationChartConfig, getWeeklyChartByVaccineConfig, getVaccRatioChartConfig } from './chartConfigs';
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
        remainingVaccTime: calculateTable(d),
        chartConfigurations: [
            getVaccChartConfig(timeSeries),
            getWeeklyChartConfig(weeklySeries),
            getWeeklyChartByVaccineConfig(weeklySeries),
            getDosesChartConfig(timeSeries, lastUpdate),
            getEstimationChartConfig(timeSeries),
            getVaccRatioChartConfig(timeSeries)
        ]
    });
}

runAsync(main, "main");

import {
    Chart,
    ArcElement,
    LineElement,
    BarElement,
    PointElement,
    BarController,
    LineController,
    LinearScale,
    TimeScale,
    TimeSeriesScale,
    CategoryScale,
    Filler,
    Legend,
    Title,
    Tooltip,
    ChartConfiguration,
    ChartDataset } from 'chart.js';
import Nano, { Component } from 'nano-jsx';

Chart.register(
    ArcElement,
    LineElement,
    BarElement,
    PointElement,
    BarController,
    LineController,
    LinearScale,
    TimeScale,
    TimeSeriesScale,
    CategoryScale,
    Filler,
    Legend,
    Title,
    Tooltip
);


export interface ChartProps {
    title: string,
    remark?: string,
    labels: string[],
    yTitle: string,
    xTitle?: string,
    datasets: ChartDataset[]
}

export class ChartComponent extends Component<ChartProps> {
    chart?: Chart;

    buildChartConfig(p: ChartProps) {
        const data = {
            labels: p.labels,
            datasets: p.datasets
        };

        const config: ChartConfiguration = {
            type: 'bar',
            data: data,
            options: {
                responsive: true,
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: p.xTitle
                        }
                    },
                    y: {
                        display: true,
                        title: {
                            display: true,
                            text: p.yTitle
                        }
                    }
                }
            },
        };

        return config;
    }

    drawChart() {
        var dosesCtx = this.getCanvas().getContext('2d');
        if(!dosesCtx) {
            throw new Error("Couldn't get canvas context.");
        }
        const config = this.buildChartConfig(this.props)
        this.chart = new Chart(dosesCtx, config);
    }

    getCanvas() {
        return this.elements[0].querySelector("canvas") as HTMLCanvasElement;
    }

    didMount() {
        this.drawChart();
    }

    render() {
      return (
        <div>
            <h2>{this.props.title}</h2>
            <canvas width="200" height="100"></canvas>
            {this.props.remark ? (<p class="remark"><i>Remark:</i> {this.props.remark}</p>): ""}
        </div>
      );
    }
}

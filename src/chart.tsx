
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
    subtitle?: string,
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
                aspectRatio: this.getAspectRatio(),
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

    getAspectRatio() {
        if(window.innerWidth < 800 && window.innerWidth < window.innerHeight) {
            return 1;
        }
        return 2;
    }

    /**
     * Responsive update of the aspect ratio, so that the chart is readable on small devices in landscape and portrait mode.
     */
    updateAspectRatio() {
        if(this.chart) {
            this.chart.options.aspectRatio = this.getAspectRatio();
            this.chart.update();
        }
    }

    drawChart() {
        var dosesCtx = this.getCanvas().getContext('2d');
        if(!dosesCtx) {
            throw new Error("Couldn't get canvas context.");
        }
        const config = this.buildChartConfig(this.props)
        this.chart = new Chart(dosesCtx, config);
        window.addEventListener('resize', () => this.updateAspectRatio());
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
            {this.props.subtitle ? (<p class="subtitle">{this.props.subtitle}</p>): ""}
            <canvas width="200" height="100"></canvas>
            {this.props.remark ? (<p class="remark"><i>Remark:</i> {this.props.remark}</p>): ""}
        </div>
      );
    }
}

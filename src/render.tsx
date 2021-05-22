import moment from 'moment';
import Nano from 'nano-jsx';
import { ChartComponent, ChartProps } from './chart';
import { Metadata } from './model';

export function render(data: AppProps) {

    const App = (props: AppProps) => (
        <div>
            <p><b>Last Update:</b> {props.lastUpdate.vaccinationsLastUpdated.format("llll")}</p>
            <h2>Remaining Vaccination Time Estimations</h2>
            <table>
                <thead>
                    <tr>
                        <th>Estimation</th>
                        <th>Remaining time</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
                    {props.remainingVaccTime.map((t) => (
                        <tr id="impf-50">
                            <td>{t.title}<br/><small>{t.subtitle}</small></td>
                            <td>{Math.round(t.days)} days<br/><small>or {Math.floor(t.days / 30)} months and {Math.round(t.days - 30*Math.floor(t.days / 30))} days</small></td>
                            <td>{moment().add(t.days, 'days').format("ddd, ll")}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <p class="remark"><i>Remark:</i> The calculation of listed dates are based on the assumption that the 7-day averages remain steady. It does not take other factors into account, such as age restrictions of vaccines.</p>

            {props.chartConfigurations.map((c) => (
                <ChartComponent {...c}></ChartComponent>
            ))}
        </div>
    );

    Nano.render(
        App(data),
        document.getElementById("content")
    );
}

export interface RemainingVaccinationTime {
    title: string,
    subtitle: string,
    days: number
}

export interface AppProps {
    lastUpdate: Metadata,
    remainingVaccTime: RemainingVaccinationTime[],
    chartConfigurations: ChartProps[],
}
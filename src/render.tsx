import moment from 'moment';
import Nano from 'nano-jsx';
import { ChartComponent, ChartProps } from './chart';
import { Metadata, RemainingVaccinationTime, VaccProgress } from './model';

export function render(data: AppProps) {

    const App = (props: AppProps) => (
        <div>
            <p><b>Last Update:</b> {props.lastUpdate.vaccinationsLastUpdated.format("llll")} ({props.lastUpdate.vaccinationsLastUpdated.fromNow()})</p>
            <h2>Vaccination Progress</h2>
            <table>
                <thead>
                    <tr>
                        <th>Value</th>
                        <th>Proportion of the population</th>
                    </tr>
                </thead>
                <tbody>
                    {props.vaccProgress.map((t) => (
                        <tr>
                            <td>{t.title}</td>
                            <td>{t.value}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
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
                        <tr class={t.meaningful?"":"grey"}>
                            <td>{t.title}{t.meaningful?"":"*"}<br/><small>{t.subtitle}</small></td>
                            <td>{Math.round(t.days)} days<br/><small>or {Math.floor(t.days / 30)} months and {Math.round(t.days - 30*Math.floor(t.days / 30))} days</small></td>
                            <td>{moment().add(t.days, 'days').format("ddd, ll")}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <p class="remark"><i>Remark:</i> The calculation of the listed dates are based on the assumption that the 7-day averages remain steady. It does not take other factors into account, such as age restrictions of vaccines. {(props.remainingVaccTime.every(t => !t.meaningful))?"":<small><br/>* This estimation is likely not meaningful at the moment due to the high number of second doses in comparison the number of first doses.</small>}</p>

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

export interface AppProps {
    lastUpdate: Metadata,
    vaccProgress: VaccProgress[],
    remainingVaccTime: RemainingVaccinationTime[],
    chartConfigurations: ChartProps[],
}
import { getBuildInfo } from "./const";
import { BaseTimeSeriesDataPoint } from "./model";

export function average(arr: number[]) {
    return arr.reduce((p, c) => p + c, 0) / arr.length;
}

export function timeSeriesPointSort(a: BaseTimeSeriesDataPoint, b: BaseTimeSeriesDataPoint) {
    return a.date.diff(b.date);
}

export function log(msg: string, err: Error | undefined = undefined) {
    console.log(msg, err);
    const b = getBuildInfo();
    if(b.logTarget) {
        fetch(`https://${b.logTarget}/api/loghttptrigger`, {method: 'POST', body: JSON.stringify({build: b, msg, error: err?.stack }), mode: 'cors' })
    }
}
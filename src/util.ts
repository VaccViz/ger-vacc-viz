import moment from "moment";
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

function errorHandler(name: string, reason: any) {
    log(`${name} failed.`, reason);
    const content = document.getElementById("content");
    if (content) {
        const error = document.createElement("p");
        error.className = "error";
        error.innerText = "Sorry, an error occurred while loading data. Please come back later.";
        content.innerHTML = '';
        content.appendChild(error);
    }
}

function success(name: string, startTime: moment.Moment) {
    const diff = moment().diff(startTime);
    log(`${name} finished after ${diff} ms.`);
}

export function runAsync(func: () => Promise<void>, name: string){
    const startTime = moment();
    func()
        .then(() => success(name, startTime))
        .catch((reason) => errorHandler(name, reason));
}
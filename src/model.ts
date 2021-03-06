import { Moment } from "moment";

export interface Metadata {
    vaccinationsLastUpdated: moment.Moment,
    deliveryLastUpdated: moment.Moment
}

export type TimeSeries = TimeSeriesDataPoint[];

export interface BaseTimeSeriesDataPoint {
    /**
     * date of the time series data point
     */
     date: Moment;
}

export interface VaccinationTimeSeriesDataPoint extends BaseTimeSeriesDataPoint {

     /**
      * Total number of vaccine doses administered til this day.
      */
     totalVaccineDoses: number;

    /**
     * Total number of people who received a first doses til this day.
     */
     totalPeopleFirstDose: number;

     /**
      * Total number of people who are fully vaccinated til this day.
      * This number is likely be different to the sum of people who received the second dose because not all vaccinations requires two doses.
      */
     totalPeopleFullyVaccinated: number;

    /**
     * Total number of people who received a third aka booster doses til this day.
     */
     totalPeopleBoosterDose: number;

     /**
      * Number of people who received a vaccine dose on that day.
      */
     peopleVaccinated: number;

     /**
      * Number of people who received their first vaccine dose on that day.
      */
     peopleFirstDose: number;

     /**
      * Number of people who received their second vaccine dose on that day.
      */
     peopleSecondDose: number;

     /**
      * Number of people who received their third vaccine dose aka booster on that day.
      */
     peopleBoosterDose: number;
}

export interface DeliveryTimeSeriesDataPoint extends BaseTimeSeriesDataPoint {
    /**
     * Number of doses delivered on that day.
     */
    dosesDelivered: number;

    /**
     *  Number of doses from Moderna delivered on that day.
     */
    modernaDosesDelivered: number;

    /**
     *  Number of doses from AstraZeneca delivered on that day.
     */
    astraDosesDelivered: number;

    /**
     *  Number of doses from Johnson & Johnson delivered on that day.
     */
    johnsonDosesDelivered: number;

    /**
     *  Number of doses from BioNTech/Pfizer delivered on that day.
     */
    comirnatyDosesDelivered: number;
}

export type CombinedTimeSeriesDataPoint = DeliveryTimeSeriesDataPoint & VaccinationTimeSeriesDataPoint;

export interface TimeSeriesDataPoint extends CombinedTimeSeriesDataPoint {
    /**
     * Total number of doses delivered til that day.
     */
    totalDosesDelivered: number;

    /**
     * Number of doses delivered but not administered til this day.
     */
    dosesAvailable: number;

    /**
     * 7-day average of new doses administered per day.
     */
    averageDoses: number;

    /**
     * 7-day average of first doses administered per day.
     */
    averageFirstDoses: number;

    /**
     * 7-day average of second doses administered per day.
     */
    averageSecondDoses: number;

    /**
     * 7-day average of third / booster doses administered per day.
     */
    averageBoosterDoses: number;
}

export interface WeekSummary extends BaseTimeSeriesDataPoint {
    /**
     * Week
     */
    date: Moment;

    /**
     * Number of people who received a vaccine dose in that week.
     */
    peopleVaccinated: number;

    /**
     * Number of people who received their first vaccine dose in that week.
     */
    peopleFirstDose: number;

    /**
     * Number of people who received their second vaccine dose in that week.
     */
    peopleSecondDose: number;

    /**
     * Number of people who received their third vaccine / booster dose in that week.
     */
     peopleBoosterDose: number;

    /**
     * Total number of doses delivered til that week.
     */
    dosesDelivered: number;

    /**
     *  Number of doses from Moderna delivered on that day.
     */
     modernaDosesDelivered: number;

     /**
      *  Number of doses from AstraZeneca delivered on that day.
      */
     astraDosesDelivered: number;

     /**
      *  Number of doses from Johnson & Johnson delivered on that day.
      */
     johnsonDosesDelivered: number;

     /**
      *  Number of doses from BioNTech/Pfizer delivered on that day.
      */
     comirnatyDosesDelired: number;
}

export interface RemainingVaccinationTime {
    title: string,
    subtitle: string,
    days: number,
    meaningful: boolean
}

export interface VaccProgress {
    title: string,
    value: string
}
const test = {
  region: {
    name: "Africa",
    avgAge: 19.7,
    avgDailyIncomeInUSD: 5,
    avgDailyIncomePopulation: 0.71,
  },
  periodType: "days",
  timeToElapse: 58,
  reportedCases: 674,
  population: 66622705,
  totalHospitalBeds: 1380614,
};

/**
 *coverts given timeToElapse depending on rhe given periodType
 *
 * @param {String} type
 * @param {Number} value
 * @returns timeToElapse in {int}
 */
const convertToDays = (periodType, timeToElapse) => {
  if (periodType.toLowerCase() === "days") return timeToElapse;
  if (periodType.toLowerCase() === "weeks") return timeToElapse * 7;
  // Assuming all months are 30 days
  if (periodType.toLowerCase() === "months") return timeToElapse * 30;
  return timeToElapse;
};

/**
 *Calls convertToDays function
 *
 * @param {Sting} periodType
 * @param {Number} timeToElapse
 */
function globalProcessTimeToElapse(periodType, timeToElapse) {
  return convertToDays(periodType, timeToElapse);
}

/**
 *Create new factor depending on timeToElapse
 *
 * @param {Number} timeToElapse
 * @returns {Number}
 */
function globalFactorByRequestedTime(timeToElapse) {
  return Math.trunc(parseInt(timeToElapse, 10) / 3);
}

/**
 *Get currently Infected cases
 *
 * @param {Number} reportedCases
 * @param {Number} factor
 * @returns {Number}
 */
function globalCurrentlyInfected(reportedCases, factor) {
  return parseInt(reportedCases, 10) * factor;
}

/**
 *To estimate the number of infected people 30 days from now, note that currentlyInfected doubles
every 3 days, so you'd have to multiply it by a factor of 2.
E.g: currentlyInfected x (2 to the power of *factor*) where factor is 10 for a 30 day
duration (there are 10 sets of 3 days in a period of 30 days)
 *
 * @param {Number} infected
 * @param {Number} requestedTime
 * @returns
 */
function globalInfectionsByRequestedTime(infected, requestedTime) {
  return infected * 2 ** requestedTime;
}

/**
 *15% of infectionsByRequestedTime . This is the estimated number of severe positive
cases that will require hospitalization to recover.
 *
 * @param {Number} percent
 * @param {Number} infectionsByReqTime
 * @returns
 */
function globalSevereCasesByRequestedTime(percent, infectionsByReqTime) {
  return Math.trunc((percent / 100) * infectionsByReqTime);
}

/**
*estimate the number of available hospital beds for severe COVID-19 positive patients. E.g 23
(meaning only 23 hospital beds will be available), or -350 (meaning there'll
be a shortage of 350 beds for severe patients after hospitals are full to capacity)
 *
 * @param {*} totalHospitalBeds
 * @param {*} severeCasesByReqTime
 * @returns
 */
function globalHospitalBedsByRequestedTime(
  totalHospitalBeds,
  severeCasesByReqTime
) {
  // Assuming only 35% of beds will be available
  return Math.trunc((35 / 100) * totalHospitalBeds - severeCasesByReqTime);
}

/**
 *5% of infectionsByRequestedTime . This is the estimated number of severe positive cases
that will require ICU care.
 *
 * @param {Number} infectionsByReqTime
 * @returns
 */
function globalCasesForICUByRequestedTime(infectionsByReqTime) {
  return Math.trunc((5 / 100) * infectionsByReqTime);
}

/**
 *2% of infectionsByRequestedTime . This is the estimated number of severe positive
cases that will require ventilators
 *
 * @param {Number} infectionsByReqTime
 * @returns
 */
function globalCasesForVentilatorsByRequestedTime(infectionsByReqTime) {
  return Math.trunc((2 / 100) * infectionsByReqTime);
}

function globalDollarsInFlight(
  infectionsByReqTime,
  requestedTime,
  avgIncome,
  avgPop
) {
  return Math.trunc((infectionsByReqTime * avgPop * avgIncome) / requestedTime);
}

class Estimator {
  constructor(type, factor, data) {
    if (type === "impact") this.factor = factor;
    if (type === "s_impact") this.factor = factor;
    const processTimeToElapse = globalProcessTimeToElapse(
      data.periodType,
      parseInt(data.timeToElapse, 10)
    );
    const currentlyInfected = globalCurrentlyInfected(
      parseInt(data.reportedCases, 10),
      factor
    );
    const factorByRequestedTime = globalFactorByRequestedTime(
      parseInt(processTimeToElapse, 10)
    );
    const infectionsByRequestedTime = globalInfectionsByRequestedTime(
      currentlyInfected,
      factorByRequestedTime
    );
    const severeCasesByRequestedTime = globalSevereCasesByRequestedTime(
      15,
      infectionsByRequestedTime
    );
    const hospitalBedsByRequestedTime = globalHospitalBedsByRequestedTime(
      data.totalHospitalBeds,
      severeCasesByRequestedTime
    );
    const casesForICUByRequestedTime = globalCasesForICUByRequestedTime(
      infectionsByRequestedTime
    );
    const casesForVentilatorsByRequestedTime = globalCasesForVentilatorsByRequestedTime(
      infectionsByRequestedTime
    );
    const dollarsInFlight = globalDollarsInFlight(
      infectionsByRequestedTime,
      processTimeToElapse,
      data.region.avgDailyIncomeInUSD,
      data.region.avgDailyIncomePopulation
    );
    return {
      currentlyInfected,
      infectionsByRequestedTime,
      severeCasesByRequestedTime,
      hospitalBedsByRequestedTime,
      casesForICUByRequestedTime,
      casesForVentilatorsByRequestedTime,
      dollarsInFlight,
    };
  }
}

const covid19ImpactEstimator = (data) => {
  const toReturn = {
    data,
    impact: new Estimator("impact", 10, data),
    severeImpact: new Estimator("s_impact", 50, data),
  };
  return toReturn;
};

covid19ImpactEstimator(test);

// module.exports = covid19ImpactEstimator;

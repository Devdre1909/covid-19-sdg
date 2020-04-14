const httpStatusCodes = require("http-status-codes");
const xmljsConvert = require("xml-js");
const path = require("path");
const fs = require("fs");
const covid19ImpactEstimator = require("./../../../../ut-dir");

const returnJson = async (req, res) => {
  if (!req.body) {
    return res.status(httpStatusCodes.UNPROCESSABLE_ENTITY).json({
      err: {
        msg: "data is required",
      },
    });
  }
  const {
    region,
    periodType,
    timeToElapse,
    reportedCases,
    population,
    totalHospitalBeds,
  } = req.body;

  if (
    !region ||
    !periodType ||
    !timeToElapse ||
    !reportedCases ||
    !population ||
    !totalHospitalBeds
  ) {
    return res.status(httpStatusCodes.UNPROCESSABLE_ENTITY).json({
      err: {
        msg: "data provided not valid",
      },
    });
  }

  const data = covid19ImpactEstimator(req.body);

  if (!data) {
    return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({
      err: {
        msg: "data provided not valid",
      },
    });
  }

  return res.status(httpStatusCodes.OK).json({
    success: {
      data,
    },
  });
};

const returnXml = async (req, res) => {
  if (!req.body) {
    return res.status(httpStatusCodes.UNPROCESSABLE_ENTITY).json({
      err: {
        msg: "data is required",
      },
    });
  }
  const {
    region,
    periodType,
    timeToElapse,
    reportedCases,
    population,
    totalHospitalBeds,
  } = req.body;

  if (
    !region ||
    !periodType ||
    !timeToElapse ||
    !reportedCases ||
    !population ||
    !totalHospitalBeds
  ) {
    return res.status(httpStatusCodes.UNPROCESSABLE_ENTITY).json({
      err: {
        msg: "data provided not valid",
      },
    });
  }

  const data = covid19ImpactEstimator(req.body);

  if (!data) {
    return res.status(httpStatusCodes.INTERNAL_SERVER_ERROR).json({
      err: {
        msg: "data provided not valid",
      },
    });
  }

  const options = {
    compact: true,
    ignoreComment: true,
    spaces: 4,
  };
  const xml = xmljsConvert.json2xml(data, options);

  res.setHeader("content-type", "application/xml");
  return res.status(httpStatusCodes.OK).send(xml);
};

const returnLog = (req, res) => {
  res.setHeader("content-type", "data/text");
  return res
    .status(httpStatusCodes.OK)
    .send(fs.readFileSync(path.join(__dirname, "../../../log.txt")));
};

module.exports = {
  returnJson,
  returnXml,
  returnLog,
};

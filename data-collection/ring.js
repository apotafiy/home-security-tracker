"use strict";
require("dotenv").config();
const pool = require("../db/index.js");
const dateAPI = require("date-and-time");
const { RingApi } = require("ring-client-api");
const ringApi = new RingApi({
  refreshToken: process.env.RING_REFRESH_TOKEN,
  cameraStatusPollingSeconds: 20,
  cameraDingsPollingSeconds: 2,
});

function parseDing(ding) {
  const id = ding.id;
  const doorbotDescription = ding.doorbot_description;
  const kind = ding.kind;
  const detectionType = ding.detection_type;
  return { id, doorbotDescription, kind, detectionType };
}

function DingData(ding) {
  const parsedDing = parseDing(ding);
  const { id, doorbotDescription, kind, detectionType } = parsedDing;
  const ring_ID = id;
  const date = dateAPI.addHours(new Date(), -7);
  // ['Thu', 'Jul', '01', '2021', '15:25:59', 'GMT-0700', '(Pacific', 'Daylight', 'Time)']
  const dateArr = date.toString().split(" ");
  const Week_Day = dateArr[0];
  const Month_Date = dateArr[2];
  const Month = dateArr[1];
  const Year = dateArr[3];
  const Time = dateArr[4];
  const Doorbot_Description = doorbotDescription;
  const Kind = kind;
  const Detection_Type = detectionType;
  return {
    ring_ID,
    Week_Day,
    Month_Date,
    Month,
    Year,
    Time,
    Doorbot_Description,
    Kind,
    Detection_Type,
  };
}

async function addToDB() {
  try {
    const cameras = await ringApi.getCameras();
    const frontCam = cameras[1];
    frontCam.onNewDing.subscribe(async (ding) => {
      try {
        const {
          Week_Day,
          Month_Date,
          Month,
          Year,
          Time,
          Doorbot_Description,
          Kind,
          Detection_Type,
        } = DingData(ding);
        const client = await pool.connect();
        const rowCount = await client.query("SELECT COUNT(*) FROM dings;");
        if (parseInt(rowCount.rows[0].count) >= 7000) {
          // heroku has a row limit so i delete the oldest entry to make room for fresh data
          await client.query(
            "DELETE FROM dings WHERE id = (SELECT MIN(id) FROM dings);"
          );
        }

        await client.query(
          `INSERT INTO dings (week_day, month_date, month, year, time, doorbot_description, kind, detection_type) values ($1, $2, $3, $4, $5, $6, $7, $8);`,
          [
            Week_Day,
            Month_Date,
            Month,
            Year,
            Time,
            Doorbot_Description,
            Kind,
            Detection_Type,
          ]
        );
        console.log("Motion: ", Time);
        client.release();
      } catch (err) {
        console.error(err);
      }
    });
    console.log("...Running");
  } catch (err) {
    console.error(err);
  }
}

module.exports = addToDB;

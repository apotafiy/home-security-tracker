// use async func to get data from db and put into object
// export func so ejs can use the data when express.render("stuff",{data:data});
// where data is the return value from the func
// {hourlyData, weeklyData, dailyData, }
// hourlyData = {label,data} etc.

// in ejs can send data as JSON.stringify(data);
// then can const parsedData = JSON.parse(data);
// so in server side...
// let stringData = JSON.stringify(db-data());
// render('stuff', {stringData});
// in ejs...
// const stringData = <% stringData %>;
// const data = JSON.parse(stringData);
const pool = require("../db/index");

async function getDBResults() {
  try {
    const client = await pool.connect();
    const query =
      "CREATE TABLE IF NOT EXISTS dings (id SERIAL NOT NULL, week_day text NOT NULL, month_date integer NOT NULL, month text NOT NULL, year integer NOT NULL, time text NOT NULL, doorbot_description text NOT NULL, kind text NOT NULL, detection_type text NOT NULL, PRIMARY KEY (id))";
    await client.query(query);
    const result = await client.query("SELECT * FROM dings ORDER BY id ASC;");
    client.release();
    return { results: result ? result.rows : null };
  } catch (err) {
    console.error(err);
  }
}

module.exports = getDBResults;

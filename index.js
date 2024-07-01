const express = require('express');
const app = express();
const requestIp = require('request-ip');
const dotenv = require('dotenv');

dotenv.config()
const port = process.env.PORT || 5000;
app.use(requestIp.mw());

app.get('/api/hello/', async (req, res) => {
  const name = req.query.visitor_name.replace(/['"]/g, '');
  const requesterIp = req.clientIp;
  console.log(requesterIp)

  // Retreive City with IP address
  const geoApiKey = process.env.GEOLOCATION_API_KEY;
  const geoUrl = `https://ipgeolocation.abstractapi.com/v1/?api_key=${geoApiKey}&ip_address=${requesterIp}`;
  let location = '';
  await fetch(geoUrl)
    .then(response => response.json())
    .then(response => {
      location = response.city;
      console.log(location)
    })
    .catch(err => {
      res.status(404).send('City not found');
    });

  // Retreive temperature with city
  let kelvinTemp = 0;
  const weatherApiKey = process.env.OPEN_WEATHER_API_kEY;
  const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${weatherApiKey}`;
  await fetch(weatherUrl)
    .then(response => response.json())
    .then(response => {
      kelvinTemp = response.main.temp;
    })
    .catch(err => {
      console.error(err);
      res.status(404).send('Temperature cannot be retreived at this time');
    });

  const celsiusTemp = kelvinTemp - 273;
  res.send({
    clientIp: requesterIp,
    location,
    message: `Hello, ${name}!, the temperature is ${Math.round(celsiusTemp)} degrees Celsius in ${location}`
  });
})

app.listen(port, () => {
 console.log(`App listening on port ${port}`);
})

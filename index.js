const express = require('express');
const app = express();
const requestIp = require('request-ip');
const dotenv = require('dotenv');

dotenv.config()
const port = process.env.PORT || 5000;
app.use(requestIp.mw());

app.get('/api/hello/', async (req, res) => {
  const name = req.query.visitor_name ? req.query.visitor_name.replace(/['"]/g, '') : 'Visitor';
  const requesterIp = req.clientIp;
  console.log(`Client IP: ${requesterIp}`);

  try {
    const geoApiKey = process.env.GEOLOCATION_API_KEY;
    if (!geoApiKey) {
      return res.status(500).send('Geolocation API key is not configured');
    }
    const geoUrl = `https://ipgeolocation.abstractapi.com/v1/?api_key=${geoApiKey}&ip_address=${requesterIp}`;
    const geoResponse = await fetch(geoUrl);
    if (!geoResponse.ok) {
      return res.status(404).send('City not found');
    }
    const geoData = await geoResponse.json();
    const location = geoData.city;
    console.log(`Location: ${location}`);

    const weatherApiKey = process.env.OPEN_WEATHER_API_kEY;
    if (!weatherApiKey) {
      return res.status(500).send('Weather API key is not configured');
    }
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${weatherApiKey}`;
    const weatherResponse = await fetch(weatherUrl);
    if (!weatherResponse.ok) {
      return res.status(500).send('Temperature could not be retreived');
    }

    const weatherData = await weatherResponse.json();
    console.log(weatherData);
    const kelvinTemp = weatherData.main.temp;
    const celsiusTemp = kelvinTemp - 273.15;
    console.log(`Temperature: ${celsiusTemp}`);
    res.send({
      clientIp: requesterIp,
      location,
      message: `Hello, ${name}!, the temperature is ${Math.round(celsiusTemp)} degrees Celsius in ${location}`
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred');
  }
})

app.listen(port, () => {
 console.log(`App listening on port ${port}`);
})

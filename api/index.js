const express = require('express');
const app = express();
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');  // Import the cors module

app.use(cors());

app.use(bodyParser.json());

const BASE_URL = 'https://api.covidtracking.com/v1/states';

// Get state name and corresponding codes
app.get('/api/states', async (req, res) => {
  try {
    const response = await axios.get('https://api.covidtracking.com/v1/states/info.json');
    const states = response.data.map(state => ({
      value: state.state,
      label: state.name
    }));
    res.json(states);
  } catch (error) {
    console.error('Error fetching data from API:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Get the last 7 days of COVID data for Arizona
app.get('/api/last7days', async (req, res) => {

  try {
	   const response = await axios.get(`${BASE_URL}/az/daily.json`);
    const data = response.data;

    // Filter data for the last 7 days
    const last7DaysData = data.slice(0, 7);
    const result = last7DaysData.map(day => ({
      date: day.date,
      positive: day.positive,
      negative: day.negative
    }));
    console.log("GET Result: ", result);

    res.json(result);
  } catch (error) {
    res.status(500).send('Error fetching data');
  }
});

// Get COVID data for a specific state and date range
app.post('/api/covid-data', async (req, res) => {
  const { state, startDate, endDate } = req.body;
  console.log("POST BODY: ", state, startDate, endDate);
  try {
    const response = await axios.get(`${BASE_URL}/${state.toLowerCase()}/daily.json`);
    const data = response.data;
    // Filter data within the date range

    const filteredData = data.filter(day => 
      day.date >= startDate && day.date <= endDate
    );

    const result = filteredData.map(day => ({
      date: day.date,
      positive: day.positive,
      negative: day.negative
    }));
    
    res.json(result);
  } catch (error) {
    res.status(500).send('Error fetching data');
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
require('dotenv').config();
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('public'));

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

const supabaseUrl = process.env.SUPABASEURL;
const supabaseKey = process.env.SUPABASEKEY;
const supabase = createClient(supabaseUrl, supabaseKey);

app.use(express.json());


app.get('/', (req, res) => {
    res.render('index', { MAP_KEY: process.env.MAP_KEY });
});

app.get('/api/uniqueFlightIds', async (req, res) => {
    try {
        const { data, error } = await supabase.from('unique_flight_id').select('flight');

        if (error) {
            throw new Error(`Supabase error: ${error.message}`);
        }

        const uniqueFlightIds = data.map(row => row.flight.trim().toLowerCase()).sort();
        res.json(uniqueFlightIds);
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/api/coordinateData', async (req, res) => {
    try {
        const { data, error } = await supabase.from('results').select('lat, lon, flight').limit(50);;

        if (error) {
            throw new Error(`Supabase error: ${error.message}`);
        }

        const coordinateData = data.map(row => ({
            lat: row.lat,
            lon: row.lon,
            flight: row.flight ? row.flight.trim().toLowerCase() : ""
        }));

        res.json({ coordinateData });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


app.get('/api/coordinateData/:flight', async (req, res) => {
    const flight = req.params.flight;

    try {
        const { data, error } = await supabase
            .from('results')
            .select('lat, lon, flight')
            .ilike('flight', `%${flight.trim()}%`);

        if (error) {
            throw new Error(`Supabase error: ${error.message}`);
        }

        const coordinateData = data.map(row => ({
            lat: row.lat,
            lon: row.lon,
            flight: row.flight ? row.flight.trim().toLowerCase() : ""
        }));

        res.json(coordinateData);
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const port = 3000;

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Connect to the SQLite database
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Could not connect to database', err);
    } else {
        console.log('Connected to database');
    }
});

// Function to calculate countdown values
function calculateCountdown() {
    const eventDate = new Date("June 20, 2024 18:30:00");
    const now = new Date();
    let timeLeft = eventDate - now;

    const msInSec = 1000;
    const msInMin = 60 * msInSec;
    const msInHr = 60 * msInMin;
    const msInDay = 24 * msInHr;

    const days = Math.floor(timeLeft / msInDay);
    const hours = Math.floor((timeLeft % msInDay) / msInHr);
    const min = Math.floor((timeLeft % msInHr) / msInMin);
    const sec = Math.floor((timeLeft % msInMin) / msInSec);

    return { days, hours, min, sec };
}

// Generate a random city for the event location
function getRandomCity() {
    const cities = [
        "New York, USA",
        "Toronto, Canada",
        "Los Angeles, USA",
        "Vancouver, Canada",
        "London, UK",
        "Las Vegas, USA",
        "Montreal, Canada",
        "Tokyo, Japan",
        "Singapore, Singapore",
        "Dubai, UAE",
        "Paris, France",
        "Stockholm, Sweden",
        "San Francisco, USA",
    ];
    const randomIndex = Math.floor(Math.random() * cities.length);
    return cities[randomIndex];
}

// Routes
app.get('/', (req, res) => {
    // Calculate countdown values
    const countdownValues = calculateCountdown();
    // Set concert date and location
    const concertDate = "June 20, 2024";
    const concertLocation = getRandomCity(); // Get a random city for the event location
    // Render index.ejs and pass countdown values, concert date, and location
    res.render('index', { ...countdownValues, concertDate, concertLocation });
});

app.get('/lineup', (req, res) => {
    // Fetch lineup data from the database
    db.all('SELECT * FROM lineup', (err, rows) => {
        if (err) {
            console.error(err.message);
            return res.status(500).send('Internal Server Error');
        }
        // Render lineup.ejs and pass lineup data
        res.render('lineup', { lineup: rows });
    });
});
app.get('/stages', (req, res) => {
    const stagesQuery = `SELECT * FROM stages`;
    const artistsQuery = `SELECT lineup.*, artist_stages.stage_id FROM lineup 
                          JOIN artist_stages ON lineup.id = artist_stages.artist_id`;

    db.all(stagesQuery, [], (err, stages) => {
        if (err) {
            return res.status(500).send("Error retrieving stages data");
        }

        db.all(artistsQuery, [], (err, artists) => {
            if (err) {
                return res.status(500).send("Error retrieving artists data");
            }

            const stagesWithArtists = stages.map(stage => {
                stage.artists = artists.filter(artist => artist.stage_id === stage.id);
                return stage;
            });

            res.render('stages', { stages: stagesWithArtists });
        });
    });
});

app.get('/faq', (req, res) => {
    res.render('faq.ejs', { /* data to pass to faq.ejs if needed */ });
});

// Route to render the contact page
app.get('/contact', (req, res) => {
    res.render('contact'); // Assuming your contact page is named 'contact.ejs' and located in the 'views' directory
});

// Route to handle form submission
app.post('/submit-contact-form', (req, res) => {
    // Here you can handle form submission logic, such as saving the form data to a database
    // For now, let's just log the form data
    console.log('Form submitted:', req.body);

    // Redirect the user to a thank you page or back to the contact page
    res.redirect('/');
});



// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

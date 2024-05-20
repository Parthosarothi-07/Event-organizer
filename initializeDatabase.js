const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Connect to the SQLite database
const db = new sqlite3.Database(path.join(__dirname, 'database.sqlite'), (err) => {
    if (err) {
        console.error('Could not connect to database', err);
    } else {
        console.log('Connected to database');
    }
});

// Create and populate the tables
db.serialize(() => {
    // Create lineup table
    db.run(`CREATE TABLE IF NOT EXISTS lineup (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        genre TEXT,
        description TEXT,
        image TEXT
    )`, (err) => {
        if (err) {
            console.error('Error creating lineup table', err);
        } else {
            console.log('Lineup table created');
        }
    });

    // Create stages table
    db.run(`CREATE TABLE IF NOT EXISTS stages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        image TEXT,
        description TEXT
    )`, (err) => {
        if (err) {
            console.error('Error creating stages table', err);
        } else {
            console.log('Stages table created');
        }
    });

    // Create artist_stages table
    db.run(`CREATE TABLE IF NOT EXISTS artist_stages (
        artist_id INTEGER,
        stage_id INTEGER,
        FOREIGN KEY (artist_id) REFERENCES lineup (id),
        FOREIGN KEY (stage_id) REFERENCES stages (id),
        PRIMARY KEY (artist_id, stage_id)
    )`, (err) => {
        if (err) {
            console.error('Error creating artist_stages table', err);
        } else {
            console.log('Artist_Stages table created');
        }
    });

    // Insert artists into lineup table
    const artists = [
        { name: 'Metallica', genre: 'Heavy Metal', description: 'Legendary heavy metal band' },
        { name: 'Iron Maiden', genre: 'Heavy Metal', description: 'Iconic heavy metal band' },
        { name: 'Slayer', genre: 'Thrash Metal', description: 'Influential thrash metal band'}
    ];

    const stmtLineup = db.prepare(`INSERT INTO lineup (name, genre, description, image) VALUES (?, ?, ?, ?)`);
    artists.forEach(artist => {
        stmtLineup.run(artist.name, artist.genre, artist.description, artist.image, (err) => {
            if (err) {
                console.error('Error inserting data into lineup table', err);
            }
        });
    });
    stmtLineup.finalize();

    // Insert stages into stages table
    const stages = [
        { name: 'Main Stage', image: 'main_stage.jpg', description: 'The main stage will feature headlining acts from around the world.' },
        { name: 'Second Stage', image: 'second_stage.jpg', description: 'The second stage will host up-and-coming bands and local talent.' },
        { name: 'Acoustic Stage', image: 'acoustic_stage.jpg', description: 'Enjoy intimate acoustic performances from your favorite artists.' }
    ];

    const stmtStages = db.prepare(`INSERT INTO stages (name, image, description) VALUES (?, ?, ?)`);
    stages.forEach(stage => {
        stmtStages.run(stage.name, stage.image, stage.description, (err) => {
            if (err) {
                console.error('Error inserting data into stages table', err);
            }
        });
    });
    stmtStages.finalize();

    // Insert data into artist_stages table (example associations)
    const artistStageAssociations = [
        { artist_id: 1, stage_id: 1 }, // Metallica -> Main Stage
        { artist_id: 2, stage_id: 2 }, // Iron Maiden -> Second Stage
        { artist_id: 3, stage_id: 3 }  // Slayer -> Acoustic Stage
    ];

    const stmtArtistStages = db.prepare(`INSERT INTO artist_stages (artist_id, stage_id) VALUES (?, ?)`);
    artistStageAssociations.forEach(association => {
        stmtArtistStages.run(association.artist_id, association.stage_id, (err) => {
            if (err) {
                console.error('Error inserting data into artist_stages table', err);
            }
        });
    });
    stmtArtistStages.finalize();
});

// Close the database connection
db.close((err) => {
    if (err) {
        console.error('Error closing the database connection', err);
    } else {
        console.log('Database connection closed');
    }
});
// Path: public/js/script.js    
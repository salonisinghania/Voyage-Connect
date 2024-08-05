require('dotenv').config();
const mongoose = require('mongoose');
const { app, server } = require('./index.js');

// Connect to MongoDB database
const initializeDbConnection = async () => {
    try {
        const mongoUri = process.env.MONGO_URI;
        
        if (!mongoUri) {
            throw new Error("MONGO_URI environment variable is not set");
        }
        
        if (!mongoUri.startsWith('mongodb://') && !mongoUri.startsWith('mongodb+srv://')) {
            throw new Error("MONGO_URI must start with 'mongodb://' or 'mongodb+srv://'");
        }
        
        await mongoose.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("Database connected successfully");
    } catch (error) {
        console.error("Error connecting to the database:", error.message);
        process.exit(1); // Exit the process with a failure code
    }
}

// Start listening on the specified port and initialize the database connection
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    initializeDbConnection().then(() => {
        console.log(`Server is running on port ${PORT}`);
    });
});

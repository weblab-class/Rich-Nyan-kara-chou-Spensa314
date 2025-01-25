// Select the database to use.
use('Cluster 0'); // Replace 'yourDatabaseName' with the name of your database

// Create a sparse and unique index on the `email` field in the `users` collection
db.getCollection('users').createIndex(
  { email: 1 }, // Index field
  { unique: true, sparse: true } // Options: unique and sparse
);

// Print a message to confirm the index was created
console.log('Sparse and unique index on email field created successfully.');

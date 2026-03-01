// test-connection.js
import prisma from '../config/prisma';


async function main() {
  try {
    // Try to connect to the database
    await prisma.$connect();
    console.log('✅ Database connection successful!');

  } catch (error) {
    console.error('❌ Unable to connect to the database:');
    console.error(error);

  } finally {
    // Always disconnect the client
    await prisma.$disconnect();
  }
}

main();
/**
 * Migration Script: Backfill Commission Rates
 * 
 * This script backfills the farmer_commission_rate and trader_commission_rate fields
 * for existing records by calculating them from stored commission/amount values.
 * 
 * Usage: node scripts/migrate_commission_rates.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Setup paths for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from parent directory
dotenv.config({ path: join(__dirname, '..', '.env') });

// Import models
import Record from '../src/models/Record.js';

async function migrateCommissionRates() {
    try {
        // Connect to MongoDB
        const mongoUri = process.env.MONGODB_URI;
        if (!mongoUri) {
            throw new Error('MONGO_URI not found in environment variables');
        }

        console.log('Connecting to MongoDB...');
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB successfully');

        // Find all records that have commission but no rate snapshot
        const recordsToUpdate = await Record.find({
            status: { $in: ['Sold', 'Completed'] },
            sale_amount: { $gt: 0 },
            $or: [
                { farmer_commission_rate: { $exists: false } },
                { farmer_commission_rate: 0 },
                { trader_commission_rate: { $exists: false } },
                { trader_commission_rate: 0 }
            ]
        });

        console.log(`Found ${recordsToUpdate.length} records to migrate`);

        let successCount = 0;
        let errorCount = 0;

        for (const record of recordsToUpdate) {
            try {
                const saleAmount = record.sale_amount || 0;

                // Calculate farmer commission rate from stored values
                let farmerRate = 0;
                if (saleAmount > 0 && record.farmer_commission) {
                    farmerRate = record.farmer_commission / saleAmount;
                } else {
                    // Default fallback to 4% if we can't calculate
                    farmerRate = 0.04;
                }

                // Calculate trader commission rate from stored values
                let traderRate = 0;
                if (saleAmount > 0 && record.trader_commission) {
                    traderRate = record.trader_commission / saleAmount;
                } else {
                    // Default fallback to 9% if we can't calculate
                    traderRate = 0.09;
                }

                // Update the record
                record.farmer_commission_rate = farmerRate;
                record.trader_commission_rate = traderRate;
                await record.save();

                successCount++;

                if (successCount % 100 === 0) {
                    console.log(`Migrated ${successCount} records...`);
                }
            } catch (error) {
                console.error(`Error migrating record ${record._id}:`, error.message);
                errorCount++;
            }
        }

        console.log('\n=== Migration Complete ===');
        console.log(`Successfully migrated: ${successCount} records`);
        console.log(`Errors: ${errorCount} records`);

    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    } finally {
        // Close the connection
        await mongoose.connection.close();
        console.log('Database connection closed');
    }
}

// Run the migration
migrateCommissionRates();

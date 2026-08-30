import { GoogleSheetsService } from './src/services/googleSheets.service';

async function run() {
  console.log("Triggering DB Sync...");
  const service = new GoogleSheetsService();
  const result = await service.syncInventory();
  console.log("Sync result:", result);
  process.exit(0);
}

run().catch(e => {
  console.error(e);
  process.exit(1);
});

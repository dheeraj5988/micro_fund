import fs from "fs";
import path from "path";

/**
 * Script to generate and save contract ABIs for frontend integration
 * Run with: npx ts-node scripts/generateABI.ts
 */

async function generateABI() {
  try {
    // Read the compiled artifact
    const artifactPath = path.join(
      __dirname,
      "../artifacts/contracts/MicroFund.sol/MicroFund.json"
    );

    if (!fs.existsSync(artifactPath)) {
      console.error("Artifact not found. Please run: npm run compile");
      process.exit(1);
    }

    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf-8"));

    // Extract ABI
    const abi = artifact.abi;

    // Create output directory if it doesn't exist
    const outputDir = path.join(__dirname, "../abi");
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Save ABI to file
    const abiPath = path.join(outputDir, "MicroFund.json");
    fs.writeFileSync(abiPath, JSON.stringify(abi, null, 2));

    console.log(`✓ ABI saved to: ${abiPath}`);

    // Generate TypeScript types
    const typesPath = path.join(outputDir, "MicroFund.ts");
    const typesContent = `export const MICROFUND_ABI = ${JSON.stringify(abi, null, 2)} as const;`;
    fs.writeFileSync(typesPath, typesContent);

    console.log(`✓ TypeScript types saved to: ${typesPath}`);
  } catch (error) {
    console.error("Error generating ABI:", error);
    process.exit(1);
  }
}

generateABI();

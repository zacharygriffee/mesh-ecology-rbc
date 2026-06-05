import {
  listOperationalProofFixtures,
  runOperationalProofSuite
} from "./index.js";

export function runProofCli(argv = process.argv.slice(2)) {
  const command = argv[0] ?? "run";
  const requestedIds = argv.slice(1);

  try {
    if (command === "list") {
      for (const id of listOperationalProofFixtures()) {
        console.log(id);
      }
      return 0;
    }

    if (command !== "run") {
      throw new Error(`Unknown proof command: ${command}`);
    }

    const results = runOperationalProofSuite(requestedIds);
    for (const result of results) {
      console.log(`${result.id} ${result.posture} ${result.effectiveViewRef}`);
    }

    return 0;
  } catch (error) {
    console.error(error.message);
    return 1;
  }
}

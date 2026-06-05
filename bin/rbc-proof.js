#!/usr/bin/env node

import { runProofCli } from "../conformance/cli.js";

process.exitCode = runProofCli();

import * as gh from "@actions/github";
import * as core from "@actions/core";

try {
  main();
} catch (error) {
  if (error instanceof Error) core.setFailed(error.message);
}

async function main() {
  const token: string = core.getInput("token", { required: true });
  const template = core.getMultilineInput("template");

  const octokit = gh.getOctokit(token);
  const context = gh.context;
  const pr = context.payload.pull_request;

  if (!pr || !pr.body) {
    core.warning("No pull request body found.");
    return;
  }

  let prDescription = pr.body;

  const checked: string[] = [];
  const unchecked: string[] = [];
  const lines = prDescription
    .split("\n")
    .filter((line) => line.trim().startsWith("- ["));

  if (lines.length === 0) {
    core.warning("No checkboxes found");
    if (template) {
      core.info("Adding template");

      const newDescription = [
        prDescription,
        "",
        "",
        "<!-- Eidted by gh-checkl -->",
        "",
        ...template.map((line) => line.trim()),
      ].join("\n");

      try {
        await octokit.rest.pulls.update({
          ...context.repo,
          pull_number: pr.number,
          body: newDescription,
        });
      } catch (error) { 
        core.setFailed("Failed to update PR description.\nMake sure the workflow has `pull_request` permission.\npermissions:\n\tpull-requests: write\n" + (error as Error)?.message);
      }

      prDescription = newDescription;
    }
  }

  for (const line of lines) {
    if (line.startsWith("- [x]")) {
      checked.push(line.substring(6).trim());
      core.info(`Found checked box: ${line}`);
    }
    if (line.startsWith("- [ ]")) {
      unchecked.push(line.substring(6).trim());
      core.info(`Found unchecked box: ${line}`);
    }
  }
  core.setOutput("checked", checked.join(","));
  core.setOutput("unchecked", unchecked.join(","));
}

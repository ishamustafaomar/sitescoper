# Set up Fimo project and create first preview

## Goal
Authenticate the Fimo CLI in this workspace using the credentials Omar provided, initialize the project with ID `2034942c-5bc9-4c4c-bb2e-24e5ae3db090`, and create the first preview per the Fimo guide.

## Steps
1. Store the provided Fimo credentials in the CLI's expected config path (`~/.config/fimo/credentials/`) so `npx fimo@latest` recognizes the session.
2. Verify authentication by running `npx fimo@latest auth status`.
3. Run `npx fimo@latest init --project-id 2034942c-5bc9-4c4c-bb2e-24e5ae3db090`.
4. Follow the Fimo guide steps for creating the first preview after initialization.
5. Report the resulting preview URL or any CLI errors.

## Notes
- The access token is treated as a secret and will not be logged or written to project files.
- If the CLI rejects the stored credentials, we’ll fall back to setting `FIMO_API_TOKEN` and retry.
- Any Fimo instructions that conflict with the existing TanStack Start stack will be flagged rather than applied blindly.

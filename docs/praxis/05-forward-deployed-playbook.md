# Forward Deployed Playbook

## Field Engagement Workflow

1. Select Solution Pack matching customer industry
2. Load Customer Context (stakeholders, systems, metrics)
3. Compile Operational Ontology from raw data
4. Start FieldLab (Floci local AWS emulation)
5. Stream Events through SQS/S3/DynamoDB
6. Generate Decisions with priority and evidence trust scores
7. Review Recommendations with human-in-the-loop
8. Capture Human Action with audit hash
9. Produce Replay Artifact (deterministically verifiable)
10. Generate Value Case with ROI calculations
11. Generate Executive Readout for CFO/COO
12. Generate Deployment Plan with risks and security review

## Dealing with Messy Data

- Use Ontology Compiler confidence scoring to identify data gaps
- Use Value-of-Information ranking to prioritize discovery questions
- Use adapter system to normalize varied formats
- Default to HUMAN_APPROVAL mode when evidence trust is low

## Security and Compliance

- All decisions are deterministically replayable (SHA-256)
- Action modes prevent unauthorized automation
- FieldLab runs in isolated Docker network
- No production access required for demo scenarios

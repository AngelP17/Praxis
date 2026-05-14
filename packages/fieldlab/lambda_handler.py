"""AWS Lambda handler for Praxis proof computation.

This Lambda provides production-grade serverless compute
for the proof generation workflow, offering warm pools and
auto-scaling compared to local FastAPI execution.
"""

import json
from typing import Any

from astraea.praxis import PraxisProofBuilder, ProofInputs


def lambda_handler(event: dict[str, Any], context: Any) -> dict[str, Any]:
    """AWS Lambda handler for proof computation.

    Args:
        event: Lambda event containing:
            - pack_id: Solution pack identifier
            - events: List of field events
            - customer_context: Customer context string
            - scenario_context: Scenario context dict
            - roi_model: ROI model dict
            - action_status: Action status (approved/rejected/etc.)
            - action_actor: Actor name (operator/etc.)
        context: Lambda context with request_id, function name, etc.
            Can be None for local execution.

    Returns:
        Response with statusCode 200 and body containing computed proof.
    """
    try:
        # Extract parameters from event
        pack_id = event.get("pack_id", "manufacturing-printer-gpo")
        events = event.get("events", [])
        customer_context = event.get("customer_context", "")
        scenario_context = event.get("scenario_context")
        roi_model = event.get("roi_model")
        action_status = event.get("action_status", "approved")
        action_actor = event.get("action_actor", "operator")
        run_id = event.get("run_id", f"lambda_run_{pack_id}")

        # Extract timestamp from context if available
        generated_at = None
        if context is not None:
            generated_at = getattr(context, "request_timestamp", None)

        # Build proof inputs
        inputs = ProofInputs(
            solution_pack=pack_id,
            events=events,
            customer_context=customer_context,
            run_id=run_id,
            generated_at=generated_at,
            scenario_context=scenario_context,
            roi_model=roi_model,
            action_status=action_status,
            action_actor=action_actor,
        )

        # Build proof using real algorithm stack
        builder = PraxisProofBuilder()
        proof = builder.build(inputs, sign=False)

        # Return computed proof
        return {
            "statusCode": 200,
            "body": json.dumps(proof),
            "run_id": run_id,
        }

    except Exception as e:
        # Log error to CloudWatch (via Lambda's automatic logging)
        print(json.dumps({"error": str(e), "event": event}))

        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)}),
        }

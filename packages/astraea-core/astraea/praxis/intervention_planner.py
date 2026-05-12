class InterventionPlanner:
    ACTION_MODES = [
        "READ_ONLY",
        "HUMAN_APPROVAL",
        "ASSISTED_ACTION",
        "WRITEBACK",
        "BLOCKED",
    ]

    ACTION_REGISTRY = {
        "acknowledge_incident": {
            "mode": "HUMAN_APPROVAL",
            "requires_approval": True,
            "risk": "low",
            "audit_required": True,
            "rollback": "No runtime mutation",
        },
        "assign_owner": {
            "mode": "ASSISTED_ACTION",
            "requires_approval": False,
            "risk": "low",
            "audit_required": True,
            "rollback": "Reassignable",
        },
        "request_vendor_support": {
            "mode": "ASSISTED_ACTION",
            "requires_approval": True,
            "risk": "low",
            "audit_required": True,
            "rollback": "No runtime mutation, communication only",
        },
        "approve_remediation": {
            "mode": "HUMAN_APPROVAL",
            "requires_approval": True,
            "risk": "medium",
            "audit_required": True,
            "rollback": "Requires rollback plan",
        },
        "escalate_to_operations": {
            "mode": "HUMAN_APPROVAL",
            "requires_approval": True,
            "risk": "medium",
            "audit_required": True,
            "rollback": "Reversible routing",
        },
        "close_with_evidence": {
            "mode": "WRITEBACK",
            "requires_approval": True,
            "risk": "medium",
            "audit_required": True,
            "rollback": "Can reopen with new evidence",
        },
    }

    def plan_action(self, action_type: str, target_object: str | None = None) -> dict:
        action_def = self.ACTION_REGISTRY.get(
            action_type,
            {
                "mode": "READ_ONLY",
                "requires_approval": True,
                "risk": "unknown",
                "audit_required": True,
                "rollback": "Unknown",
            },
        )

        return {
            "action_type": action_type,
            "mode": action_def["mode"],
            "requires_approval": action_def["requires_approval"],
            "target_system": target_object or "praxis",
            "risk": action_def["risk"],
            "audit_required": action_def["audit_required"],
            "rollback": action_def["rollback"],
        }

    def is_writable(self, action_type: str) -> bool:
        action_def = self.ACTION_REGISTRY.get(action_type, {})
        return action_def.get("mode") in ("WRITEBACK", "ASSISTED_ACTION")

    def requires_approval(self, action_type: str) -> bool:
        action_def = self.ACTION_REGISTRY.get(action_type, {})
        return action_def.get("requires_approval", True)

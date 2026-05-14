"""Deterministic ROI model calculation for solution packs."""

from __future__ import annotations

import ast
import operator
from typing import Any


class RoiFormulaError(ValueError):
    """Raised when an ROI formula uses unsupported syntax or unknown variables."""


class RoiCalculator:
    """Evaluate solution-pack ROI formulas with a restricted arithmetic AST."""

    OPERATORS = {
        ast.Add: operator.add,
        ast.Sub: operator.sub,
        ast.Mult: operator.mul,
        ast.Div: operator.truediv,
        ast.USub: operator.neg,
        ast.UAdd: operator.pos,
    }

    def calculate(self, roi_model: dict[str, Any] | None) -> dict[str, Any]:
        roi_model = roi_model or {}
        variables = {
            str(key): float(value)
            for key, value in (roi_model.get("variables") or {}).items()
            if isinstance(value, int | float)
        }
        formulas = roi_model.get("formulas") or {}
        calculations: dict[str, float] = {}

        for name, definition in formulas.items():
            expression = (
                definition.get("expression") if isinstance(definition, dict) else definition
            )
            if not isinstance(expression, str):
                raise RoiFormulaError(f"ROI formula {name!r} must provide an expression string")
            environment = {**variables, **calculations}
            calculations[str(name)] = round(self._eval(expression, environment), 2)

        declared_calculations = roi_model.get("calculations") or {}
        declared_annual_value = declared_calculations.get("annual_value")
        annual_value = (
            round(float(declared_annual_value), 2)
            if isinstance(declared_annual_value, int | float)
            else calculations.get("annual_value", 0.0)
        )
        return {
            "estimated_annual_value": annual_value,
            "calculations": calculations,
            "variables": variables,
            "declared_calculations": declared_calculations,
        }

    def _eval(self, expression: str, variables: dict[str, float]) -> float:
        try:
            tree = ast.parse(expression, mode="eval")
        except SyntaxError as exc:
            raise RoiFormulaError(f"Invalid ROI expression: {expression}") from exc
        return float(self._eval_node(tree.body, variables))

    def _eval_node(self, node: ast.AST, variables: dict[str, float]) -> float:
        if isinstance(node, ast.Constant) and isinstance(node.value, int | float):
            return float(node.value)
        if isinstance(node, ast.Name):
            if node.id not in variables:
                raise RoiFormulaError(f"Unknown ROI variable: {node.id}")
            return float(variables[node.id])
        if isinstance(node, ast.BinOp) and type(node.op) in self.OPERATORS:
            left = self._eval_node(node.left, variables)
            right = self._eval_node(node.right, variables)
            return self.OPERATORS[type(node.op)](left, right)
        if isinstance(node, ast.UnaryOp) and type(node.op) in self.OPERATORS:
            return self.OPERATORS[type(node.op)](self._eval_node(node.operand, variables))
        raise RoiFormulaError(f"Unsupported ROI expression syntax: {ast.dump(node)}")

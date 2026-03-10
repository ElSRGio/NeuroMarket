"""
Input validators for the NeuroMarket Engine API
"""


def validate_range(value, min_val=0, max_val=100, name="value"):
    if not isinstance(value, (int, float)):
        raise ValueError(f"{name} must be a number")
    if not (min_val <= value <= max_val):
        raise ValueError(f"{name} must be between {min_val} and {max_val}")
    return float(value)


def validate_positive(value, name="value"):
    if not isinstance(value, (int, float)) or value < 0:
        raise ValueError(f"{name} must be a non-negative number")
    return float(value)


def validate_idm_array(arr):
    if not isinstance(arr, list) or len(arr) != 12:
        raise ValueError("idm_array must be a list of exactly 12 values")
    return [float(v) for v in arr]

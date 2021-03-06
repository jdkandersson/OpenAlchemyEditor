"""Controllers for specs."""

import connexion
from open_alchemy.schemas import validation
from open_alchemy.schemas.validation import unmanaged

from . import exceptions, helpers, types


def validate_managed(body: str) -> types.TSpec:
    """
    Validate a spec.

    Args:
        body: The spec.

    Returns:
        The validation result.

    """
    print(body)  # allow-print
    language = connexion.request.headers["X-LANGUAGE"]

    spec: types.TSpec
    try:
        spec = helpers.load_spec(spec_str=body, language=language)
    except exceptions.LoadSpecError as exc:
        return {"result": {"valid": False, "reason": str(exc)}}

    return validation.check(spec=spec)


def validate_un_managed(body: str) -> types.TSpec:
    """
    Validate a spec.

    Args:
        body: The spec.

    Returns:
        The validation result.

    """
    print(body)  # allow-print
    language = connexion.request.headers["X-LANGUAGE"]

    spec: types.TSpec
    try:
        spec = helpers.load_spec(spec_str=body, language=language)
    except exceptions.LoadSpecError as exc:
        return {"result": {"valid": False, "reason": str(exc)}}

    return unmanaged.check(spec=spec)

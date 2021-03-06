"""Memory implementation for the seed facade."""

import typing

from . import exceptions, types


class MemorySeed:
    """Interface for seeds."""

    def __init__(self) -> None:
        """Construct."""
        self.seeds: typing.Dict[types.TSeedName, types.TSeedValue] = {}

    def list(self) -> types.TSeedNames:
        """List available seeds."""
        return list(self.seeds.keys())

    def get(self, *, name: types.TSeedName) -> types.TSeedValue:
        """Get a seed by name."""
        if name not in self.seeds:
            raise exceptions.SeedNotFoundError(f"could not find seed {name}")
        return self.seeds[name]

    def set(self, *, name: types.TSeedName, value: types.TSeedValue) -> None:
        """Set a seed name to a value."""
        self.seeds[name] = value

    def delete(self, *, name: types.TSeedName) -> None:
        """Delete a seed by name."""
        if name not in self.seeds:
            raise exceptions.SeedNotFoundError(f"could not find seed {name}")
        del self.seeds[name]

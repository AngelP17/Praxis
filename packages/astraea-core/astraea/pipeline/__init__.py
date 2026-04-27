def __getattr__(name: str):
    if name == "AstraeaPipeline":
        from astraea.core.pipeline import AstraeaPipeline as _AstraeaPipeline

        return _AstraeaPipeline
    raise AttributeError(f"module {__name__!r} has no attribute {name!r}")

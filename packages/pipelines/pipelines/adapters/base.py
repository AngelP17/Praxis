from abc import ABC, abstractmethod


class BaseAdapter(ABC):
    adapter_name: str = "base"
    supported_formats: list[str] = []

    @abstractmethod
    def parse(self, raw_data: str | bytes | dict) -> list[dict]: ...

    @abstractmethod
    def normalize(self, record: dict) -> dict: ...

    def get_profile(self) -> dict:
        return {
            "adapter_name": self.adapter_name,
            "supported_formats": self.supported_formats,
        }

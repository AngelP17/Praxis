import httpx

from domain.events import printer_offline_event


def main() -> None:
    event = printer_offline_event(
        asset_id="printer.weifps01",
        hostname="WEIFPS01",
        site="TX",
    )
    response = httpx.post(
        "http://localhost:8000/api/decisions/evaluate",
        json=event.model_dump(mode="json"),
        timeout=10,
    )
    response.raise_for_status()
    print(response.json())


if __name__ == "__main__":
    main()

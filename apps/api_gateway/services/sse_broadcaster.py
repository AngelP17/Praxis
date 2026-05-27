import asyncio
from typing import Set

class SSEBroadcaster:
    def __init__(self):
        self._listeners: Set[asyncio.Queue] = set()

    def subscribe(self) -> asyncio.Queue:
        q = asyncio.Queue()
        self._listeners.add(q)
        return q

    def unsubscribe(self, q: asyncio.Queue):
        self._listeners.discard(q)

    def broadcast(self, data: any):
        for q in self._listeners:
            try:
                q.put_nowait(data)
            except asyncio.QueueFull:
                pass

event_broadcaster = SSEBroadcaster()
decision_broadcaster = SSEBroadcaster()

# Security Review: Network Edge Failover Controls

## Data Privacy & Access Control
Praxis acts as a read-only telemetry consumer. Network device logs, interface states, and ICMP monitoring signals are collected via encrypted syslog/SNMP. No sensitive packet contents or payloads are read or transmitted.

## Execution Model Security
Remediation scripts (like interface toggle or DHCP flush) are executed using highly restricted SSH/Netmiko tasks on Firewall-EDGE-01. These service accounts utilize public-key authentication, have access limited strictly to the required commands, and require explicit HUMAN_APPROVAL.

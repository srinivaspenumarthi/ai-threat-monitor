# 2-Minute Demo Script

## Opening

"Threat Monitor is a web-based cybersecurity tool that watches nginx access logs, detects suspicious requests with hybrid rules and machine learning, and helps small website owners investigate threats in real time."

## Step 1

Show the protected sample website running locally through nginx.

"This sample site is hosted with nginx so it produces real access logs."

## Step 2

Show the Threat Monitor dashboard.

"Threat Monitor is connected to the nginx access log and is monitoring incoming traffic."

## Step 3

Send a suspicious request:

```bash
curl "http://localhost:8088/login?id=%27%20OR%20%271%27%3D%271"
```

## Step 4

Show the new alert or threat record appearing.

"The system detects the suspicious request and scores it based on multiple detection components."

## Step 5

Open the threat detail panel.

"Here we can see the request target, model scores, why it was flagged, a recommended action, and a response playbook."

## Step 6

Open the Models page.

"The system also supports retraining its models using stored events plus synthetic attack traffic, which makes it adaptable instead of static."

## Closing

"Threat Monitor gives small websites a lightweight way to understand, detect, and respond to web threats without paid enterprise infrastructure."

#!/bin/bash

# Start cron service
service cron start

# Run the notification worker in daemon mode
python cron_worker.py 
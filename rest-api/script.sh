#!/bin/bash

exec uvicorn routes.api:app --host 0.0.0.0 --port 9020

#!/bin/bash


supervisord -c /etc/supervisor/supervisord.conf &
exec  tail -f /dev/null
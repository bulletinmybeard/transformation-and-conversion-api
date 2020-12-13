#!/bin/bash

# Run supervisor, so we can run multiple services.
supervisord -n -c /etc/supervisor/conf.d/supervisord.conf

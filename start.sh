#!/bin/bash
#Script that launches the application,checking first if DB is initialized
#Also, keeps server alive if it crashes

node scripts/check-database.js
if [ $? -eq 1 ] ; then
    node scripts/initialize-db.js
fi
until node server.js; do
    echo 'Server crashed. Respawning...' >&2
    sleep 1
done

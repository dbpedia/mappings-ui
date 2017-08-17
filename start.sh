#!/bin/bash
#Script that launches the application,checking first if DB is initialized
#Also, keeps server alive if it crashes

node check-database.js
if [ $? -eq 1 ] ; then
    node initialize-db.js
fi
until node server.js; do
    echo 'Server crashed. Respawning...' >&2
    sleep 1
done

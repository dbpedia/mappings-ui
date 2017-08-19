#!/bin/bash
hostip=$(ip route show | awk '/default/ {print $3}'); echo $hostip
echo $hostip parenthost >> /etc/hosts


#!/bin/bash

trap 'kill $(jobs -p)' EXIT

for f in `find /opt -maxdepth 1 -type d -name "alfresco-*"`; do
    if [ -r "$f/tomcat/logs/catalina.out" ]; then
        tail -f "$f/tomcat/logs/catalina.out" &
    fi
    if [ -r "$f/tomcat/logs/share.log" ]; then
        tail -f "$f/tomcat/logs/share.log" &
    fi
    if [ -r "$f/tomcat/logs/alfresco.log" ]; then
        tail -f "$f/tomcat/logs/alfresco.log" &
    fi
done

wait

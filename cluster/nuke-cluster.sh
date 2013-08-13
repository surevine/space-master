#!/bin/bash

rm -rf `find /opt -type d -name alfresco-*`
rm -rf `find /var -type d -name alfresco-*`
rm -f `find /var -type l -name alfresco-*`
